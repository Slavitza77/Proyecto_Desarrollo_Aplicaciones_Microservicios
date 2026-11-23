from rest_framework import status
from rest_framework.test import APITestCase

from .models import Album, Track


class CatalogoApiTests(APITestCase):
    def setUp(self):
        self.album = Album.objects.create(
            titulo='Rumours', artista='Fleetwood Mac', anio=1977, genero='Rock')
        Track.objects.create(album=self.album, titulo='Go Your Own Way',
                             numero_pista=1, duracion_segundos=223)

    def test_listar_albumes_incluye_tracks_anidados(self):
        r = self.client.get('/api/albumes/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.json()[0]['tracks'][0]['titulo'], 'Go Your Own Way')

    def test_crear_album_y_track(self):
        r = self.client.post('/api/albumes/', {
            'titulo': 'Nevermind', 'artista': 'Nirvana', 'anio': 1991, 'genero': 'Grunge'},
            format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        r2 = self.client.post('/api/tracks/', {
            'album': r.json()['id'], 'titulo': 'Lithium',
            'numero_pista': 5, 'duracion_segundos': 257}, format='json')
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)

    def test_actualizar_y_obtener_track(self):
        t = Track.objects.first()
        r = self.client.patch(f'/api/tracks/{t.id}/', {'titulo': 'Otra'}, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(f'/api/tracks/{t.id}/').json()['titulo'], 'Otra')

    def test_borrar_album_elimina_tracks_en_cascada(self):
        r = self.client.delete(f'/api/albumes/{self.album.id}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Track.objects.count(), 0)
