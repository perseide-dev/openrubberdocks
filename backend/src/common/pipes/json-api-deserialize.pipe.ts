import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class JsonApiDeserializePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // Si la petición no tiene body o no cumple mínimamente la estructura, la rechazamos
        if (!value || !value.data) {
            throw new BadRequestException('Invalid JSON:API payload. The "data" object is required.');
        }

        const { id, attributes, relationships } = value.data;

        if (!attributes) {
            throw new BadRequestException('Invalid JSON:API payload. The "attributes" object is required.');
        }


        const dto = { ...attributes };


        if (id) {
            dto.id = id;
        }

        return dto;
    }
}