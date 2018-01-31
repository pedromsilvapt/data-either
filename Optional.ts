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

export class NoSuchElementError extends Error {}

export class Optional<T> {
    /**
     * Return an object signifying an empty result.
     * 
     * @static
     * @template T 
     * @returns {Optional<T>} 
     * 
     * @memberof Optional
     */
    static empty<T>  () : Optional<T> {
        return new Optional( null, true );
    };

    /**
     * Return an object containing the provided value
     * 
     * @static
     * @template T 
     * @param {T} value 
     * @returns {Optional<T>} 
     * 
     * @memberof Optional
     */
    static of<T> ( value : T ) : Optional<T> {
        return new Optional<T>( value );
    }

    /**
     * Return an Optional object, that is either empty if the provided value 
     * is null or undefined, or else contains the provided value
     * 
     * @static
     * @template T 
     * @param {T} value 
     * @returns {Optional<T>} 
     * 
     * @memberof Optional
     */
    static ofNullable<T> ( value : T ) : Optional<T> {
        if ( value === null || value === void 0 ) {
            return Optional.empty<T>();
        }

        return this.of( value );
    }

    /**
     * Receives a promise and returns an Optional object containing the value if the
     * promise resolves, or an empty optional if it rejects
     * 
     * @static
     * @template T 
     * @param {Promise<T>} promise 
     * @returns {Promise<Optional<T>>} 
     * 
     * @memberof Optional
     */
    static ofPromise<T> ( promise : Promise<T> ) : Promise<Optional<T>> {
        return promise
            .then( value => Optional.of( value ) )
            .catch( () => Optional.empty() );
    }

    protected value : T;
    protected empty : boolean;

    constructor ( value : T, empty : boolean = false ) {
        this.value = !empty ? value : null;
        this.empty = empty;
    }

    /**
     * If present, return the value this object contains. If not present, throws a
     * NoSuchElementException error.
     * 
     * @returns {T} 
     * 
     * @memberof Optional
     */
    get () : T {
        if ( this.isPresent() ) {
            return this.value;
        }

        throw new NoSuchElementError();
    }

    /**
     * Check if the value is present.
     * 
     * @returns {boolean} 
     * 
     * @memberof Optional
     */
    isPresent () : boolean {
        return !this.empty;
    }

    /**
     * Check if the optional is empty.
     * 
     * @returns {boolean} 
     * 
     * @memberof Optional
     */
    isEmpty () : boolean {
        return this.empty;
    }

    /**
     * Perform an action only if the value is present.
     * 
     * @param {Consumer<T>} consumer 
     * @returns {this} 
     * 
     * @memberof Optional
     */
    ifPresent ( consumer : Consumer<T> ) : this {
        if ( this.isPresent() ) {
            consumer( this.get() );
        }

        return this;
    }

    /**
     * Perform an action only if the optional is empty
     * 
     * @param {Function} consumer 
     * @returns {this} 
     * 
     * @memberof Optional
     */
    ifEmpty ( consumer : Function ) : this {
        if ( this.isEmpty() ) {
            consumer();
        }

        return this;
    }

    /**
     * Return a new optional that is either empty if this one's empty, or that
     * contains the value resulting from mapping the current value
     * 
     * @template U 
     * @param {Mapper<T, U>} mapper 
     * @returns {Optional<U>} 
     * 
     * @memberof Optional
     */
    map <U> ( mapper : Mapper<T, U> ) : Optional<U> {
        if ( this.isPresent() ) {
            return Optional.of( mapper( this.get() ) );
        }

        return Optional.empty<U>();
    }

    /**
     * If a value is present, apply the provided Optional-bearing mapping function
     * to it, return that result, otherwise return an empty Optional.
     * 
     * @template U 
     * @param {Mapper<T, Optional<U>>} mapper 
     * @returns {Optional<U>} 
     * 
     * @memberof Optional
     */
    flatMap <U> ( mapper : Mapper<T, Optional<U>> ) : Optional<U> {
        if ( this.isPresent() ) {
            return mapper( this.get() );
        }

        return Optional.empty<U>();
    }

    /**
     * If the value present, flat maps it wit Optional.ofNullable, otherwise
     * returns just an empty Optional.
     * 
     * @returns {Optional<T>} 
     * 
     * @memberof Optional
     */
    flatNullable () : Optional<T>{
        return this.flatMap( Optional.ofNullable );
    }
    
    /**
     * If a value is present, and the value matches the given predicate,
     * return an Optional describing the value, otherwise return an empty Optional.
     * 
     * @param {Predicate<T>} predicate 
     * @returns {Optional<T>} 
     * 
     * @memberof Optional
     */
    filter ( predicate : Predicate<T> ) : Optional<T> {
        if ( this.isPresent() && predicate( this.get() ) ) {
            return Optional.of( this.get() );
        }

        return Optional.empty<T>();
    }
    
    /**
     * Return the value if present, otherwise return other.
     * 
     * @param {T} other 
     * @returns {T} 
     * 
     * @memberof Optional
     */
    orElse ( other : T ) : T {
        if ( this.isPresent() ) {
            return this.get();
        }

        return other;
    }
    
    /**
     * Return the value if present, otherwise invoke 
     * other and return the result of that invocation.
     * 
     * @param {() => T} supplier 
     * @returns {T} 
     * 
     * @memberof Optional
     */
    orElseGet ( supplier : () => T ) : T {
        if ( this.isPresent() ) {
            return this.get();
        }

        return supplier();
    }

    /**
     * Return the contained value, if present, 
     * otherwise throw an exception to be created by the provided supplier.
     * 
     * @template E 
     * @param {Supplier<E>} supplier 
     * @returns {T} 
     * 
     * @memberof Optional
     */
    orElseThrow<E extends Error> ( supplier : Supplier<E> ) : T {
        if ( this.isPresent() ) {
            return this.get();
        }

        throw supplier();
    }
}