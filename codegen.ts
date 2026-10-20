import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "http://localhost:2200/graphql", // your Express GraphQL server (or a path to a .graphql schema file)
    documents: ["src/**/*.graphql"], // operations live in each module's graphql/ folder
    ignoreNoDocuments: true,
    generates: {
        "./src/gql/": {
            preset: "client",
            presetConfig: { fragmentMasking: false }, // keeps fragment fields directly accessible
            config: {
                documentMode: "string", // emits typed strings, ideal for fetch
                scalars: { DateTime: "string", DateTimeISO: "string" }, // dates arrive as ISO strings
            },
        },
    },
};

export default config;
