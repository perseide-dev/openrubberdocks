import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    parseMarkdownTable,
    serializeTableToMarkdown,
    formatBytes,
} from '@features-workspaces/files/utils/table-markdown.utils';
import { parseOpenApiSpec } from '@features-workspaces/files/utils/openapi-parser.utils';
import {
    parseMarkdownToBlocks,
    serializeBlocksToMarkdown,
} from '@features-workspaces/files/utils/markdown-block.parser';

describe('Rich Documentation Blocks — Frontend Utilities & Parsers', () => {
    it('parses and serializes multidimensional Markdown tables bidirectionally', () => {
        const rawMd = [
            '| ENDPOINT | METHOD | AUTH |',
            '| --- | --- | --- |',
            '| /storage/upload | POST | document:write |',
            '| /storage/quota/:id | GET | document:read |',
        ].join('\n');

        const parsed = parseMarkdownTable(rawMd);
        assert.deepEqual(parsed.headers, ['ENDPOINT', 'METHOD', 'AUTH']);
        assert.equal(parsed.rows.length, 2);
        assert.deepEqual(parsed.rows[0], ['/storage/upload', 'POST', 'document:write']);

        const serialized = serializeTableToMarkdown(parsed);
        assert.equal(serialized, rawMd);
    });

    it('formats byte sizes into human-readable storage strings', () => {
        assert.equal(formatBytes(0), '0 B');
        assert.equal(formatBytes(512), '512 B');
        assert.equal(formatBytes(2048), '2.0 KB');
        assert.equal(formatBytes(524288000), '500.0 MB');
    });

    it('parses YAML and JSON OpenAPI 3.0 contracts into interactive endpoint descriptors', () => {
        const yamlSpec = `
openapi: 3.0.3
info:
  title: Storage Contract
  version: 2.1.0
  description: Hybrid binary storage endpoints
servers:
  - url: http://localhost:3000
paths:
  /storage/upload:
    post:
      summary: Upload binary
      tags:
        - Storage
      responses:
        '201':
          description: Created
  /storage/quota/{workspaceUuid}:
    get:
      summary: Check quota
      parameters:
        - name: workspaceUuid
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Quota status
`;
        const { spec, error } = parseOpenApiSpec(yamlSpec);
        assert.equal(error, null);
        assert.ok(spec);
        assert.equal(spec.title, 'Storage Contract');
        assert.equal(spec.version, '2.1.0');
        assert.equal(spec.endpoints.length, 2);
        assert.equal(spec.endpoints[0].method, 'POST');
        assert.equal(spec.endpoints[0].path, '/storage/upload');
        assert.equal(spec.endpoints[1].method, 'GET');
        assert.equal(spec.endpoints[1].parameters[0].name, 'workspaceUuid');
        assert.equal(spec.endpoints[1].parameters[0].required, true);
    });

    it('round-trips all 6 rich block types between Markdown and FileEditorBlock structures', () => {
        const markdownDoc = [
            '# System Architecture',
            '',
            '> [!WARNING] Enforce Workspace storage quotas before writing binaries',
            '',
            '| SERVICE | DRIVER |',
            '| --- | --- |',
            '| StorageModule | local / s3 |',
            '',
            '```mermaid',
            'flowchart LR',
            '  Client --> API',
            '```',
            '',
            '```openapi',
            'openapi: 3.0.3',
            'info:',
            '  title: Demo',
            '  version: 1.0.0',
            '```',
            '',
            '[[document:11111111-1111-4111-8111-111111111111|Storage Guide]]',
            '',
            '[attachment:audit.log](/storage/attachments/att-1/content)',
            '',
            '![diagram](/storage/attachments/att-2/content)',
        ].join('\n');

        const parsedBlocks = parseMarkdownToBlocks(markdownDoc);
        const blockTypes = parsedBlocks.map((b) => b.type);

        assert.deepEqual(blockTypes, [
            'heading_1',
            'callout',
            'table',
            'mermaid',
            'openapi_spec',
            'internal_link',
            'file_attachment',
            'image',
        ]);

        const editorBlocks = parsedBlocks.map((b, i) => ({
            id: `b-${i}`,
            type: b.type,
            content: b.content,
            checked: b.checked,
            properties: b.properties,
        }));

        const exportedMd = serializeBlocksToMarkdown(editorBlocks);
        assert.ok(exportedMd.includes('> [!WARNING] Enforce Workspace storage quotas'));
        assert.ok(exportedMd.includes('| SERVICE | DRIVER |'));
        assert.ok(exportedMd.includes('```mermaid'));
        assert.ok(exportedMd.includes('```openapi'));
        assert.ok(
            exportedMd.includes(
                '[[document:11111111-1111-4111-8111-111111111111|Storage Guide]]',
            ),
        );
        assert.ok(exportedMd.includes('[attachment:audit.log](/storage/attachments/att-1/content)'));
    });
});
