import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, 'src');

const aliasPairs = [
    ['@features-workspaces/', 'features/workspaces/'],
    ['@features/', 'features/'],
    ['@utils-functions/', 'core/utils/functions/'],
    ['@utils-constants/', 'core/utils/constants/'],
    ['@utils-labels/', 'core/utils/labels/'],
    ['@http-base/', 'core/http/base/'],
    ['@http-error/', 'core/http/error/'],
    ['@http-types/', 'core/http/types/'],
    ['@config-env', 'core/config/env/index.ts'],
    ['@components/', 'core/components/'],
    ['@theme/', 'core/theme/'],
];

registerHooks({
    resolve(specifier, context, nextResolve) {
        for (const [prefix, replacement] of aliasPairs) {
            if (specifier === prefix || specifier.startsWith(prefix)) {
                const subPath = specifier.slice(prefix.length);
                const resolvedPath = path.join(rootDir, replacement, subPath);
                const withExt = resolvedPath.endsWith('.ts')
                    ? resolvedPath
                    : `${resolvedPath}.ts`;
                return nextResolve(pathToFileURL(withExt).href, context);
            }
        }
        return nextResolve(specifier, context);
    },
});
