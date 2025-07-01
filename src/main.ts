import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // La aplicación se ejecutará automáticamente al iniciar
  // Los resultados se mostrarán en consola

  console.log('Ruklo Tech Test - Resultados mostrados arriba');
  console.log('Presiona Ctrl+C para salir');

  await app.listen(3000);
}
void bootstrap();
