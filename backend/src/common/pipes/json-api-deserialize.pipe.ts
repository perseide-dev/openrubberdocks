import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class JsonApiDeserializePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || !value.data) {
      throw new BadRequestException('Invalid JSON:API payload. The "data" object is required.');
    }

    const { id, attributes, relationships } = value.data;

    if (!attributes) {
      throw new BadRequestException('Invalid JSON:API payload. The "attributes" object is required.');
    }

    const dto: any = { ...attributes };

    if (id) {
      dto.id = id;
    }

    if (relationships) {
      Object.keys(relationships).forEach(key => {
        const relationData = relationships[key]?.data;

        if (relationData === null) {
          dto[key] = null;
          return;
        }

        if (!relationData) return;

        if (Array.isArray(relationData)) {
          dto[key] = relationData.map(rel => ({ id: rel.id }));
        }
        else {
          dto[key] = { id: relationData.id };
        }
      });
    }

    return dto;
  }
}