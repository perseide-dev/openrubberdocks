import { JsonApiInterceptor } from './json-api.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('JsonApiInterceptor', () => {
  let interceptor: JsonApiInterceptor<any>;
  const resourceType = 'test-resource';

  beforeEach(() => {
    interceptor = new JsonApiInterceptor<any>(resourceType);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should handle null or undefined data', (done) => {
    const context = {} as ExecutionContext;
    const next = {
      handle: () => of(null),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({ data: null });
      done();
    });
  });

  it('should format a single resource correctly', (done) => {
    const context = {} as ExecutionContext;
    const next = {
      handle: () => of({ id: 1, name: 'Test', age: 30 }),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        jsonapi: { version: '1.0' },
        data: {
          type: resourceType,
          id: '1',
          attributes: {
            name: 'Test',
            age: 30,
          },
        },
      });
      done();
    });
  });

  it('should format an array of resources correctly', (done) => {
    const context = {} as ExecutionContext;
    const next = {
      handle: () => of([
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ]),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        jsonapi: { version: '1.0' },
        data: [
          {
            type: resourceType,
            id: '1',
            attributes: { name: 'Test 1' },
          },
          {
            type: resourceType,
            id: '2',
            attributes: { name: 'Test 2' },
          },
        ],
      });
      done();
    });
  });

  it('should extract single relationships and populate included array', (done) => {
    const context = {} as ExecutionContext;
    const next = {
      handle: () => of({
        id: 1,
        title: 'Post 1',
        author: { id: 10, name: 'Author Name' },
      }),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toEqual({
        jsonapi: { version: '1.0' },
        data: {
          type: resourceType,
          id: '1',
          attributes: { title: 'Post 1' },
          relationships: {
            author: { data: { type: 'author', id: '10' } },
          },
        },
        included: [
          {
            type: 'author',
            id: '10',
            attributes: { name: 'Author Name' },
          },
        ],
      });
      done();
    });
  });

  it('should extract array relationships and populate included array without duplicates', (done) => {
    const context = {} as ExecutionContext;
    const next = {
      handle: () => of({
        id: 1,
        title: 'Post 1',
        comments: [
          { id: 100, text: 'First' },
          { id: 100, text: 'First Duplicate' }, // same ID to test included map uniqueness
          { id: 101, text: 'Second' },
        ],
      }),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result.data.relationships.comments.data).toHaveLength(3);
      expect(result.included).toHaveLength(2); // Only 100 and 101
      expect(result.included).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'comments', id: '100' }),
          expect.objectContaining({ type: 'comments', id: '101' }),
        ])
      );
      done();
    });
  });

  it('should ignore properties like Date objects as relationships', (done) => {
    const context = {} as ExecutionContext;
    const date = new Date();
    const next = {
      handle: () => of({ id: 1, createdAt: date }),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result.data.attributes.createdAt).toBe(date);
      expect(result.data.relationships).toBeUndefined();
      done();
    });
  });
});
