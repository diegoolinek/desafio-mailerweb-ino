import uuid
from django.db import models


class OutboxEvent(models.Model):
    class EventType(models.TextChoices):
        BOOKING_CREATED = 'BOOKING_CREATED', 'Booking Created'
        BOOKING_UPDATED = 'BOOKING_UPDATED', 'Booking Updated'
        BOOKING_CANCELED = 'BOOKING_CANCELED', 'Booking Canceled'


    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSED = 'PROCESSED', 'Processed'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=50, choices=EventType.choices)
    
    payload = models.JSONField() 
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    attempts = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.event_type} - {self.status} (Attempts: {self.attempts})"
