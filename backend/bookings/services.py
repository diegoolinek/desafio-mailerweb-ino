from datetime import timedelta
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
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
                
                # TODO: Criar o evento do Celery
                
                return booking
                
        except IntegrityError:
            raise ValidationError("Booking overlap detected. The room is not available for this time.")
