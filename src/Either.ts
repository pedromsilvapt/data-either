import { Optional } from "./Optional";

export interface Mapper<T, U> {
    ( value : T ) : U;
}

export interface Consumer<T> {
    ( value : T ) : void;
}

export interface Predicate<T> {
    ( value : T ) : boolean;
}

export interface Supplier<T> {
    () : T;
}

export class WrongSideError extends Error {}

export enum EitherSide {
    Left = 0,
    Right = 1
}

export class Either<L, R> {
    protected side : EitherSide;

    protected value : L | R;

    protected get left () : L {
        return this.value as L;
    }

    protected get right () : R {
        return this.value as R;
    }

    /**
     * Instantiates an Either object with a left value.
     * 
     * @static
     * @template L 
     * @template R 
     * @param {L} value 
     * @returns {Either<L, R>} 
     * @memberof Either
     */
    static left<L, R> ( value : L ) : Either<L, R> {
        return new Either<L, R>( EitherSide.Left, value );
    }

    /**
     * Instantiates an Either object, with a right value.
     * 
     * @static
     * @template L 
     * @template R 
     * @param {R} value 
     * @returns {Either<L, R>} 
     * @memberof Either
     */
    static right<L, R> ( value : R ) : Either<L, R> {
        return new Either<L, R>( EitherSide.Right, value );
    }

    /**
     * Converts a function that might throw an error into an Either object.
     * Left represents the successful return value of the function.
     * Right represents the catched value in the try ... catch.
     * 
     * @static
     * @template L 
     * @template R 
     * @param {Supplier<L>} supplier 
     * @returns {Either<L, R>} 
     * @memberof Either
     */
    static ofThrowable<L, R> ( supplier : Supplier<L> ) : Either<L, R> {
        try {
            return Either.left( supplier() );
        } catch ( error ) {
            return Either.right( error );
        }
    }

    /**
     * Converts a NodeJS-style async callback that receives an error and a value.
     * If the error is different than null, calls the callback with the error on the right 
     * side. If error is null, calls the callback with the value on the left side.
     * 
     * @static
     * @template L 
     * @template R 
     * @param {Consumer<Either<L, R>>} cb 
     * @returns {( err : R, value : L ) => void} 
     * @memberof Either
     */
    static ofCallback<L, R> ( cb : Consumer<Either<L, R>> ) : ( err : R, value : L ) => void {
        return ( err, value ) => {
            if ( err ) {
                cb( Either.right( err ) );
            }

            cb( Either.left( value ) );
        };
    }

    /**
     * Converts a promise of a value that might return a rejection into a
     * promise that always resolves with an Either object.
     * 
     * Left represents the resolve of the original promise,
     * while Right represents a rejection.
     * 
     * @static
     * @template L 
     * @template R 
     * @param {Promise<L>} promise 
     * @returns {Promise<Either<L, R>>} 
     * @memberof Either
     */
    static ofPromise<L, R> ( promise : Promise<L> ) : Promise<Either<L, R>> {
        return promise
            .then( value => Either.left<L, R>( value ) )
            .catch( error => Either.right<L, R>( error ) );
    }

    constructor ( side : EitherSide.Left, value : L );
    constructor ( side : EitherSide.Right, value : R );
    constructor ( side : EitherSide, value : L | R ) {
        this.side = side;
        this.value = value;
    }

    /**
     * Returns a boolean indicating if this object represents a left value.
     * 
     * @returns {boolean} 
     * @memberof Either
     */
    isLeft () : boolean {
        return this.side === EitherSide.Left;
    }

    /**
     * Returns a boolean indicating if this object represents a right value.
     * 
     * @returns {boolean} 
     * @memberof Either
     */
    isRight () : boolean {
        return this.side === EitherSide.Right;
    }

    /**
     * Returns the value. Can be either left or right.
     * 
     * @returns {(L | R)} 
     * @memberof Either
     */
    get () : L | R {
        return this.value;
    }

    /**
     * Returns the value of the left side. If this object is the right side,
     * throws a WrongSideError.
     * 
     * @throws {WrongSideError}
     * @returns {L} 
     * @memberof Either
     */
    getLeft () : L {
        if ( this.isLeft() ) {
            return this.left;
        }

        throw new WrongSideError();
    }

    /**
     * Returns the value of the right side. If this object is the left side,
     * throws a WrongSideError.
     * 
     * @throws {WrongSideError}
     * @returns {R} 
     * @memberof Either
     */
    getRight () : R {
        if ( this.isRight() ) {
            return this.right;
        }

        throw new WrongSideError();
    }

    /**
     * Perform an action only if the left value is present.
     * 
     * @param {Consumer<L>} consumer 
     * @returns {this} 
     * @memberof Either
     */
    ifLeft ( consumer : Consumer<L> ) : this {
        if ( this.isLeft() ) {
            consumer( this.left );
        }

        return this;
    }

    /**
     * Perform an action only if the right value is present.
     * 
     * @param {Consumer<R>} consumer 
     * @returns {this} 
     * @memberof Either
     */
    ifRight ( consumer : Consumer<R> ) : this {
        if ( this.isRight() ) {
            consumer( this.right );
        }

        return this;
    }

    reduce<O> ( left : Mapper<L, O>, right : Mapper<R, O> ) : O {
        console.log( this.isLeft(), this.isRight(), left, right );
        if ( this.isLeft() ) {
            return left( this.left );
        } else if ( this.isRight() ) {
            return right( this.right );
        }
    }


    flatMap<NL, NR> ( left : Mapper<L, Either<NL, NR>>, right : Mapper<R, Either<NL, NR>> ) : Either<NL, NR> {
        return this.reduce( left, right );
    }

    flatMapLeft<NL> ( mapper : Mapper<L, Either<NL, R>> ) : Either<NL, R> {
        return this.flatMap( mapper, v => Either.right( v ) );
    }

    flatMapRight<NR> ( mapper : Mapper<R, Either<L, NR>> ) : Either<L, NR> {
        return this.flatMap( v => Either.left( v ), mapper );
    }

    map<NL, NR> ( left : Mapper<L, NL>, right : Mapper<R, NR> ) : Either<NL, NR> {
        return this.flatMap( 
            v => Either.left( left( v ) ),
            v => Either.right( right( v ) )
        );
    }

    mapLeft<NL> ( mapper : Mapper<L, NL> ) : Either<NL, R> {
        return this.map( mapper, id => id );
    }

    mapRight<NR> ( mapper : Mapper<R, NR> ) : Either<L, NR> {
        return this.map( id => id, mapper );
    }

    leftOrElseGet ( getter : Supplier<L> ) : L {
        if ( this.isLeft() ) {
            return this.left;
        }

        return getter();
    }

    leftOrElse ( other : L ) : L {
        return this.leftOrElseGet( () => other );
    }

    leftOrElseThrow<E extends Error> ( supplier : Supplier<E> ) : L {
        if ( this.isLeft() ) {
            this.getLeft();
        }

        throw supplier();
    }

    rightOrElseGet ( getter : Supplier<R> ) : R {
        if ( this.isRight() ) {
            return this.right;
        }

        return getter();
    }

    rightOrElse ( other : R ) : R {
        return this.rightOrElseGet( () => other );
    }

    rightOrElseThrow<E extends Error> ( supplier : Supplier<E> ) : R {
        if ( this.isRight() ) {
            this.getRight();
        }

        throw supplier();
    }
}
