import pytest
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from rooms.models import Room
from bookings.models import Booking
from bookings.services import BookingService


@pytest.mark.django_db
class TestBookingService:
    def setup_method(self):
        self.user = User.objects.create_user(username="testuser", password="123")
        self.room = Room.objects.create(name="Sala A", capacity=10)
        self.now = timezone.now().replace(minute=0, second=0, microsecond=0)

    def test_create_valid_booking(self):
        """Deve criar uma reserva válida perfeitamente"""
        start = self.now + timedelta(days=1, hours=10)
        end = start + timedelta(hours=1)
        
        booking = BookingService.create_booking(self.user, self.room, "Reunião 1", start, end)
        
        assert booking is not None
        assert Booking.objects.count() == 1

    def test_fails_if_duration_less_than_15_minutes(self):
        """A duração mínima é de 15 minutos"""
        start = self.now + timedelta(days=1, hours=10)
        end = start + timedelta(minutes=14)
        
        with pytest.raises(ValidationError, match="15 minutes"):
            BookingService.create_booking(self.user, self.room, "Curta", start, end)

    def test_fails_if_duration_more_than_8_hours(self):
        """A duração máxima é de 8 horas"""
        start = self.now + timedelta(days=1, hours=10)
        end = start + timedelta(hours=8, minutes=1)
        
        with pytest.raises(ValidationError, match="8 hours"):
            BookingService.create_booking(self.user, self.room, "Longa", start, end)

    def test_fails_if_start_after_end(self):
        """A data de início não pode ser maior que a do fim"""
        start = self.now + timedelta(days=1, hours=10)
        end = start - timedelta(hours=1)
        
        with pytest.raises(ValidationError, match="start_at"):
            BookingService.create_booking(self.user, self.room, "Invertida", start, end)

    def test_fails_on_overlap_with_active_booking(self):
        """O banco deve bloquear sobreposição de horários na mesma sala"""
        start = self.now + timedelta(days=1, hours=10)
        end = start + timedelta(hours=2)
        
        Booking.objects.create(user=self.user, room=self.room, title="Reserva 1", start_at=start, end_at=end)

        overlap_start = start + timedelta(hours=1)
        overlap_end = end + timedelta(hours=1)
        
        with pytest.raises(ValidationError, match="overlap"):
            BookingService.create_booking(self.user, self.room, "Reserva 2", overlap_start, overlap_end)

    def test_allows_touching_bookings(self):
        """Reservas que apenas 'encostam' no horário são permitidas"""
        start = self.now + timedelta(days=1, hours=10)
        end = start + timedelta(hours=2)
        Booking.objects.create(user=self.user, room=self.room, title="Reserva 1", start_at=start, end_at=end)

        touch_start = end
        touch_end = end + timedelta(hours=2)
        
        booking = BookingService.create_booking(self.user, self.room, "Reserva 2", touch_start, touch_end)
        assert booking is not None

    def test_allows_overlap_with_canceled_booking(self):
        """Deve permitir reservar no mesmo horário se a reserva anterior estiver cancelada"""
        start = self.now + timedelta(days=1, hours=10)
        end = start + timedelta(hours=2)
        
        Booking.objects.create(
            user=self.user, room=self.room, title="Reserva Cancelada", 
            start_at=start, end_at=end, status=Booking.Status.CANCELED
        )

        booking = BookingService.create_booking(self.user, self.room, "Nova Reserva", start, end)
        assert booking is not None
