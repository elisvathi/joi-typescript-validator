# joi-typescript-validator

Allows to create validation schemas by using typescript decorators using [joi](https://github.com/hapijs/joi) as a backend

## Inspiration

## Table of contents

* Required Validation
* Optional
* Nested Objects
* Strings
* Numbers
* Arrays

## Docs

Coming soon...

## Example
```typescript
    class User {

        @Required()
        @Email()
        public email: string;

        @Required()
        @MaxLength(30)
        @MinLength(5)
        public username: string;

        @Required()
        @MaxLength(30)
        @MinLength(5)
        public password: string;

        @Optional()
        @Min({value: 18})
        @Max({value: 30, exclude: true})
        public age: number;
    }
```

