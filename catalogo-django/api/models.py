from django.db import models


class Album(models.Model):
    titulo = models.CharField(max_length=150)
    artista = models.CharField(max_length=150)
    anio = models.PositiveSmallIntegerField()
    genero = models.CharField(max_length=60, blank=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.titulo} - {self.artista} ({self.anio})'


class Track(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='tracks')
    titulo = models.CharField(max_length=150)
    numero_pista = models.PositiveSmallIntegerField()
    duracion_segundos = models.PositiveIntegerField()

    class Meta:
        ordering = ['album', 'numero_pista']

    def __str__(self):
        return f'{self.numero_pista}. {self.titulo}'
