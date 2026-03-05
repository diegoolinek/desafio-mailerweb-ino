from datetime import timedelta
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from notifications.models import OutboxEvent
from notifications.tasks import process_outbox_event
from .models import Booking


class BookingService:
    @classmethod
    def create_booking(cls, user, room, title, start_at, end_at):
        if start_at >= end_at:
            raise ValidationError({"start_at": "start_at must be before end_at"})
        
        duration = end_at - start_at
        
        if duration < timedelta(minutes=15):
            raise ValidationError("Duration must be at least 15 minutes.")
            
        if duration > timedelta(hours=8):
            raise ValidationError("Duration cannot exceed 8 hours.")

        try:
            with transaction.atomic():
                booking = Booking.objects.create(
                    user=user,
                    room=room,
                    title=title,
                    start_at=start_at,
                    end_at=end_at
                )
                
                payload = {
                    "title": booking.title,
                    "room": room.name,
                    "start_at": booking.start_at.isoformat(),
                    "end_at": booking.end_at.isoformat(),
                    "user_email": user.email
                }

                outbox_event = OutboxEvent.objects.create(
                    event_type=OutboxEvent.EventType.BOOKING_CREATED,
                    payload=payload
                )
                
                transaction.on_commit(lambda: process_outbox_event.delay(outbox_event.id))
                
                return booking
                
        except IntegrityError:
            raise ValidationError("Booking overlap detected. The room is not available for this time.")


    @classmethod
    def update_booking(cls, booking, title, start_at, end_at):
        if start_at >= end_at:
            raise ValidationError({"start_at": "start_at must be before end_at"})
        
        duration = end_at - start_at
        if duration < timedelta(minutes=15):
            raise ValidationError("Duration must be at least 15 minutes.")
        if duration > timedelta(hours=8):
            raise ValidationError("Duration cannot exceed 8 hours.")

        try:
            with transaction.atomic():
                booking.title = title
                booking.start_at = start_at
                booking.end_at = end_at
                booking.save()

                payload = {
                    "title": booking.title,
                    "room": booking.room.name,
                    "start_at": booking.start_at.isoformat(),
                    "end_at": booking.end_at.isoformat(),
                    "user_email": booking.user.email
                }

                outbox_event = OutboxEvent.objects.create(
                    event_type=OutboxEvent.EventType.BOOKING_UPDATED,
                    payload=payload
                )
                transaction.on_commit(lambda: process_outbox_event.delay(outbox_event.id))
                return booking
        except IntegrityError:
            raise ValidationError("Booking overlap detected. The room is not available for this time.")


    @classmethod
    def cancel_booking(cls, booking):
        with transaction.atomic():
            booking.status = Booking.Status.CANCELED
            booking.save()

            payload = {
                "title": booking.title,
                "room": booking.room.name,
                "start_at": booking.start_at.isoformat(),
                "end_at": booking.end_at.isoformat(),
                "user_email": booking.user.email
            }

            outbox_event = OutboxEvent.objects.create(
                event_type=OutboxEvent.EventType.BOOKING_CANCELED,
                payload=payload
            )
            transaction.on_commit(lambda: process_outbox_event.delay(outbox_event.id))
            return booking
