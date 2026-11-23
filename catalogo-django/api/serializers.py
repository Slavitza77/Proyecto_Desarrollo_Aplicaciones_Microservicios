from rest_framework import serializers

from .models import Album, Track


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'album', 'titulo', 'numero_pista', 'duracion_segundos']


class AlbumSerializer(serializers.ModelSerializer):
    # Serialización anidada: cada álbum incluye sus pistas (solo lectura).
    tracks = TrackSerializer(many=True, read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'titulo', 'artista', 'anio', 'genero', 'tracks']
