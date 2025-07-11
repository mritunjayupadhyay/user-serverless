/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { APIGatewayProxyHandler } from 'aws-lambda';
import * as express from 'express';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

const bootstrap = async () => {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    const basePath = `/${process.env.NODE_ENV || 'dev'}/`;
    const config = new DocumentBuilder()
      .setTitle('Question Bank API')
      .setDescription('API documentation for the Question Bank')
      .setVersion('1.0')
      .addServer(basePath)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        basePath: basePath,
      },
    });

    await app.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
};

export const handler: APIGatewayProxyHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const server = await bootstrap();
  return server(event, context);
};
