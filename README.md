# Either

> Simple TypeScript/ES2017 class to represent either values

# Installation
```shell
npm install --save data-either
```

# Usage
```typescript
import { Either } from 'data-either';

const left = Either.left( 1 );
const right = Either.right( 20 );

left.isRight(); // false
right.isRight(); // true
```

You can also convert trowable functions into either.
```typescript
import { Either } from 'data-either';

const left = Either.ofThrowable( () => 2 );
const right = Either.ofThrowable( () => { throw new Error(); } );

left.getLeft(); // 2
right.getRight(); // Error
```

Convert a Promise that can reject into an always resolved promise.
```typescript
import { Either } from 'data-either';

const left = Either.ofPromise( Promise.resolve( "left" ) );
const right = Either.ofPromise( Promise.reject( new Error() ) );

left.getLeft(); // "left"
right.getRight(); // Error
```

There are also a number of computations that can be done functionally with this module.
```typescript
import { Either } from 'data-either';

let value : Either<number, string> = Either.left( 1 );

value = value.map( n => n * 3, err => `Error: ${ err }` ); // Either.left( 3 )

value = value.flatMap( n => n % 2 === 0 ? Either.left( n ) : Either.right( "Error: Not event." ), r => Either.right( r ) ); // Either.right( "Error: Not even." )
// Or simply
value = value.flatMapLeft( n => n % 2 === 0 ? Either.left( n ) : Either.right( "Error: Not event." ) ); // Either.right( "Error: Not even." )

value.leftOrElse( 0 ); // 0
```