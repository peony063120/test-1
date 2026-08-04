"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logger_service_1 = require("./infrastructure/logger/logger.service");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const logger = app.get(logger_service_1.LoggerService);
    app.useGlobalPipes((0, validation_pipe_1.createValidationPipe)());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useLogger(logger);
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Product Management System API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`Application started on port ${port}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map