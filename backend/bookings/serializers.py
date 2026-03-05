from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.name', read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'title', 'room', 'room_name', 'start_at', 'end_at', 'status')
        read_only_fields = ('id', 'status', 'room_name')
