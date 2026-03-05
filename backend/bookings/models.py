import uuid
from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import RangeOperators
from django.db.models import Q, F
from rooms.models import Room


class Booking(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        CANCELED = 'CANCELED', 'Canceled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    room = models.ForeignKey(Room, on_delete=models.RESTRICT, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='bookings')
    
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(start_at__lt=F('end_at')),
                name='check_start_before_end'
            ),
            ExclusionConstraint(
                name='prevent_booking_overlap',
                expressions=[
                    ('room', RangeOperators.EQUAL),
                    (models.Func(F('start_at'), F('end_at'), function='tstzrange'), RangeOperators.OVERLAPS),
                ],
                condition=Q(status='ACTIVE'),
            )
        ]

    def __str__(self):
        return f"{self.title} - {self.room.name} ({self.start_at} to {self.end_at})"
