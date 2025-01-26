# Project Overview

## Conventions

- For stateless operations, prefer functions over classes
- If many related things are involved, use a class (we love classes unless it is just stupid not to write a plain function)
- Prefer constructors with a single argument, or at most 2 arguments (e.g. config | context, options | context, config)
- Prefer constructor dependency injection and avoid using concrete classes in constructor parameters unless it is justified
- Each folder you create should have `index.ts` file that exports all the public API of the folder
