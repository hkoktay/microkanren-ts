// Datastructure representing logic variables
export class Var {
    n: number = 0;

    constructor(n: number) {
        this.n = n;
    }

    isEqual(x: Var): boolean {
        if (x.n === this.n) {
            return true;
        } else {
            return false;
        }
    }
}

// Datastructure to hold bindings of lagic variables
export class Substitution {
    bindings: Array<[Var, any]> = [];

    constructor(l?: Array<[Var, any]>) {
        if (l == undefined) {
            this.bindings = [];
        } else {
            this.bindings = l;
        }
    }

    extend(u: Var, val: any): Substitution {
        return new Substitution(this.bindings.concat([[u, val]]));
    }

    // Search for logic variable in bindings
    walk(u: any): any {
        let pr = false;
        const getVar = (v: Var): any => {
            let result = false;
            for (let item of this.bindings) {
                if (item[0] != undefined) {
                    if (v.isEqual(item[0])) {
                        result = item[1];
                        break;
                    }
                }
            }
            return result;
        };
        if (u instanceof Var) {
            pr = getVar(u);
            // console.log(`bindings: ${this.bindings}`)
            // console.log(`pr is ${pr}`)
            if (pr === false) {
                return u;
            } else {
                return this.walk(pr);
            }
        } else {
            return u;
        }
    }
}

// Datastructure that holds the microkanren program state
//
// Microkanren programs proceed if we apply a goal function to a State
// datastructure. A State has two properties: sub and counter. The sub
// property is a Substitution datastructure, which holds the bindings
// of logic variables to values. The counter is used to assign a unique
// number to a logic variable.
export class State {
    sub: Substitution;
    counter: number;

    constructor(sub?: Substitution, counter?: number) {
        if (sub == undefined || counter == undefined) {
            this.sub = new Substitution();
            this.counter = 0;
        } else {
            this.sub = sub;
            this.counter = counter;
        }
    }
}

// Datastructure for microkanren streams
//
// We get a MkStream by applying a goal type function to a State data
// structure. A MkStream can be mature or immature. If the stream is 
// mature the current element of the content property is an empty array
// or a list of State data structures. If the stream is immature the
// content property of the class is a function.
export class MkStream {
    content: any;

    constructor(st?: any) {
        if (st == undefined) {
            this.content = [];
        } else {
            this.content = st;
        }
    }

    isEmpty(): boolean {
        if ((this.content instanceof Array) && (this.content.length == 0)) {
            return true;
        } else {
            return false;
        }
    }

    isImmature(): boolean {
        if (this.content instanceof Function) {
            return true;
        } else {
            return false;
        }
    }

    extend(l: any): MkStream {
        if (this.content instanceof Array) {
            return new MkStream(this.content.concat(l));
        } else {
            throw "The content of this Stream is not a list."
        }
    }
}

export interface Goal {
    (state: State): MkStream;
}

export interface MkFunc {
    (v: Var): Goal;
}

// Unifies two microkanren stream data structures
export const unify = (u: any, v: any, s: Substitution): Substitution | false => {
    const nu = s.walk(u);
    const nv = s.walk(v);
    if ((nu instanceof Var) && (nv instanceof Var) && (nu.isEqual(nv))) {
        return s;
    } else if (nu instanceof Var) {
        return s.extend(nu, nv);
    } else if (nv instanceof Var) {
        return s.extend(nv, nu);
    } else if ((nu instanceof Array) && (nv instanceof Array) && (nu.length > 0) && (nv.length > 0)) {
        let newSub = unify(nu[0], nv[0], s);
        if (newSub == false) {
            return false;
        } else {
            return unify(nu.slice(1), nv.slice(1), newSub);
        }
    } else if ((nu instanceof Array) && (nv instanceof Array) && (nu.length == 0) && (nv.length == 0)) {
        return s;
    } else if (nu == nv) {
        return s;
    } else {
        return false;
    }
}

// Creates a MkStream data structure from a State
export const unit = (sc: State): MkStream => {
    return new MkStream().extend(sc);
}

// The equal goal constructor
export const equal = (u: any, v: any): Goal => {
    return (sc: State): MkStream => {
        const s = unify(u, v, sc.sub);
        if (s == false) {
            return new MkStream();
        } else {
            const newState = new State(s, sc.counter);
            return unit(newState);
        }
    }
}

// Goal constructor that introduces new logic variables
export const callFresh = (f: MkFunc): Goal => {
    return (sc: State) => {
        const c = sc.counter;
        const v = new Var(c);
        const newState = new State(sc.sub, sc.counter + 1);
        return f(v)(newState);
    }
}

// The disj goal constructor
export const disj = (g1: Goal, g2: Goal): Goal => {
    return (sc: State): MkStream => {
        return mplus(g1(sc), g2(sc));
    }
}

// The conj goal constructor
export const conj = (g1: Goal, g2: Goal): Goal => {
    return (sc: State): MkStream => {
        return bind(g1(sc), g2);
    }
}

// Merges two streams
export const mplus = (st1: MkStream, st2: MkStream): MkStream => {
    const lst1 = st1.content;
    const lst2 = st2.content;

    function mplusHelper(l1: any, l2: any): any {
        if ((l1 instanceof Array) && (l1.length == 0)) {
            return l2;
        } else if (l1 instanceof Array) {
            let first = [].concat(l1[0]);
            return first.concat(mplusHelper(l1.slice(1), l2));
        } else {
            return () => mplus(st2, l1());
        }
    }
    return new MkStream(mplusHelper(lst1, lst2));
}

// Applies a goal *g* to a MkStream *st*
export const bind = (st: MkStream, g: Function): MkStream => {
    if (st.isEmpty()) {
        return new MkStream();
    } else if (st.isImmature()) {
        return new MkStream(() => bind(st.content[0](), g));
    } else {
        return mplus(g(st.content[0]), bind(new MkStream(st.content.slice(1)), g));
    };
}