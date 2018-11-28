const mk = require("../dist/microkanren.js");

describe("test walk", () => {
    it("test substitution walk, find bindings at beginning and end", () => {
        const sub = new mk.Substitution().extend(new mk.Var(1), "eins").extend(new mk.Var(2), "zwei");
        expect(sub.walk(new mk.Var(2))).toEqual("zwei");
        expect(sub.walk(new mk.Var(1))).toEqual("eins");
    });
    it("test substitution walk, find binding in the middle", () => {
        const sub = new mk.Substitution()
            .extend(new mk.Var(1), "eins")
            .extend(new mk.Var(2), "zwei")
            .extend(new mk.Var(3), "drei");
        expect(sub.walk(new mk.Var(2))).toEqual("zwei");
    });
    it("test substitution walk, no Var in Substitution", () => {
        const sub = new mk.Substitution().extend(new mk.Var(1), "eins").extend(new mk.Var(2), "zwei");
        expect(sub.walk(new mk.Var(3))).toEqual(new mk.Var(3));
    });
    it("test substitution walk with empty Substitution", () => {
        const sub = new mk.Substitution();
        expect(sub.walk(new mk.Var(1))).toEqual(new mk.Var(1));
    });
    it("test substitution walk, no Var in Substitution", () => {
        const sub = new mk.Substitution()
            .extend(new mk.Var(1), "eins")
            .extend(new mk.Var(5), "five")
            .extend(new mk.Var(2), new mk.Var(3))
            .extend(new mk.Var(3), new mk.Var(4))
            .extend(new mk.Var(4), new mk.Var(5));
        expect(sub.walk(new mk.Var(2))).toEqual("five");
    })
});

describe("test unify", () => {
    it("test unify with two equal Vars", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify(new mk.Var(0), new mk.Var(0), sub);
        expect(computedResult.bindings.length).toEqual(1);
        expect(computedResult.bindings[0][0].n).toEqual(0);
        expect(computedResult.bindings[0][1]).toEqual(2);
    });
    it("test unify with Var and number, Var is not in Sub", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify(new mk.Var(0), 3, sub);
        expect(computedResult).toEqual(false);
    });
    it("test unify with Var and number", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify(new mk.Var(0), 3, sub);
        expect(computedResult).toEqual(false);
    });
    it("test unify with Var extending the Substitution", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify(new mk.Var(0), new mk.Var(1), sub);
        expect(computedResult.bindings.length).toEqual(2);
        expect(computedResult.bindings[0][0].n).toEqual(0);
        expect(computedResult.bindings[0][1]).toEqual(2);
        expect(computedResult.bindings[1][0].n).toEqual(1);
        expect(computedResult.bindings[1][1]).toEqual(2);
    });
    it("test unify with lists as arguments", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify([new mk.Var(0), new mk.Var(1)], [new mk.Var(0), new mk.Var(1)], sub);
        expect(computedResult.bindings[0][1]).toEqual(2);
    });
    it("test unify with two equal terms", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify(2, 2, sub);
        expect(computedResult.bindings.length).toEqual(1);
        expect(computedResult.bindings[0][0].n).toEqual(0);
        expect(computedResult.bindings[0][1]).toEqual(2);
    });
    it("test unify with non-equal arguments", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify(2, 3, sub);
        expect(computedResult).toEqual(false);
    });
    it("test unify with two empty arrays", () => {
        const sub = new mk.Substitution().extend(new mk.Var(0), 2);
        const computedResult = mk.unify([], [], sub);
        expect(computedResult.bindings.length).toEqual(1);
        expect(computedResult.bindings[0][0].n).toEqual(0);
        expect(computedResult.bindings[0][1]).toEqual(2);
    });
});

describe("test equal", () => {
    it("with two equal arguments", () => {
        const s = new mk.State(new mk.Substitution().extend(new mk.Var(0), 1), 1);
        const computedResult = mk.equal(1, 1)(s);
        expect(computedResult.content[0].sub.bindings[0][1]).toEqual(1);
        expect(computedResult.content[0].sub.bindings.length).toEqual(1);
        expect(computedResult.content[0].counter).toEqual(1);
    });
    it("with two equal Vars", () => {
        const s = new mk.State(new mk.Substitution().extend(new mk.Var(0), 1), 1);
        const computedResult = mk.equal(new mk.Var(0), new mk.Var(0))(s);
        expect(computedResult.content[0].sub.bindings[0][1]).toEqual(1);
        expect(computedResult.content[0].sub.bindings.length).toEqual(1);
        expect(computedResult.content[0].counter).toEqual(1);
    });
    it("with extended Substitution", () => {
        const s = new mk.State(new mk.Substitution().extend(new mk.Var(0), 1), 1);
        const computedResult = mk.equal(2, new mk.Var(1))(s);
        expect(computedResult.content[0].sub.bindings.length).toEqual(2);
        expect(computedResult.content[0].sub.bindings[0][1]).toEqual(1);
        expect(computedResult.content[0].sub.bindings[1][1]).toEqual(2);
        expect(computedResult.content[0].counter).toEqual(1);
    });
    it("Var already in Substitution", () => {
        const s = new mk.State(new mk.Substitution().extend(new mk.Var(0), 1), 1);
        const computedResult = mk.equal(2, new mk.Var(0))(s);
        expect(computedResult.isEmpty()).toEqual(true);
    });
    it("Var with empty Substitution", () => {
        const s = new mk.State(new mk.Substitution());
        const computedResult = mk.equal(2, new mk.Var(0))(s);
        expect(computedResult.content.length).toEqual(1);
        expect(computedResult.content[0].sub.bindings[0][1]).toEqual(2);
    });
    it("with matching list argument", () => {
        const s = new mk.State(new mk.Substitution()
            .extend(new mk.Var(0), 1)
            .extend(new mk.Var(1), [2, 3]), 1);
        const computedResult = mk.equal([2, 3], new mk.Var(1))(s);
        expect(computedResult.content.length).toEqual(1);
        expect(computedResult.content[0].sub.bindings[1][1]).toEqual([2, 3]);
    });
    it("with non matching list argument", () => {
        const s = new mk.State(new mk.Substitution().extend(new mk.Var(1), [2, 3]), 1);
        const computedResult = mk.equal([2, 1], new mk.Var(1))(s);
        expect(computedResult.isEmpty()).toEqual(true);
    });
});

describe("Test callFresh", () => {
    it("creating new logic variable", () => {
        const s = new mk.State(new mk.Substitution(), 0);
        const computedResult = mk.callFresh((x) => mk.equal(x, "a"))(s);
        expect(computedResult.content[0].sub.bindings[0][1], "a");
        expect(computedResult.content[0].sub.bindings[0][0].n, 0);
        expect(computedResult.content[0].sub.bindings.length, 1);
        expect(computedResult.content[0].counter, 1);
    });
    it("extending the Substitution", () => {
        const s = new mk.State(new mk.Substitution().extend(new mk.Var(0), "one"), 1);
        const computedResult = mk.callFresh((x) => mk.equal(x, "a"))(s);
        expect(computedResult.content[0].sub.bindings[0][1], "one");
        expect(computedResult.content[0].sub.bindings[1][1], "a");
        expect(computedResult.content[0].sub.bindings[0][0].n, 0);
        expect(computedResult.content[0].sub.bindings[1][0].n, 1);
        expect(computedResult.content[0].sub.bindings.length, 2);
        expect(computedResult.content[0].counter, 2);
    });
    it("with conj", () => {
        const s = new mk.State();
        const computedResult = mk.callFresh(
            (x) => mk.callFresh((y) => mk.conj(mk.equal(y, x), mk.equal("z", x)))
        )(s);
        expect(computedResult.content[0].sub.bindings[0][0].n, 1);
        expect(computedResult.content[0].sub.bindings[0][1].n, 0);
        expect(computedResult.content[0].sub.bindings[1][0].n, 0);
        expect(computedResult.content[0].sub.bindings[1][1], ["z"]);
        expect(computedResult.content[0].sub.bindings.length, 1);
        expect(computedResult.content[0].counter, 2);
    });
    it("with disj", () => {
        const s = new mk.State();
        const computedResult = mk.disj(
            mk.callFresh((x) => mk.equal("z", x)),
            mk.callFresh((x) => mk.equal(["s", "z"], x))
        )(s);
        expect(computedResult.content[0].sub.bindings[0][0].n, 0);
        expect(computedResult.content[0].sub.bindings[0][1], "z");
        expect(computedResult.content[1].sub.bindings[0][0].n, 0);
        expect(computedResult.content[1].sub.bindings[0][1], ["s", "z"]);
        expect(computedResult.content[0].sub.bindings.length, 1);
        expect(computedResult.content[1].sub.bindings.length, 1);
        expect(computedResult.content[0].counter, 1);
        expect(computedResult.content[1].counter, 1);
    });
});

describe("Test mplus", () => {
    it("with two empty streams", () => {
        const st1 = new mk.MkStream();
        const st2 = new mk.MkStream();
        const computedResult = mk.mplus(st1, st2);
        expect(computedResult.content, []);
    });
    it("with two streams", () => {
        const st1 = new mk.MkStream().extend(new mk.State(new mk.Substitution().extend(new mk.Var(0), 5), 1));
        const st2 = new mk.MkStream().extend(new mk.State(new mk.Substitution().extend(new mk.Var(0), 6), 1));
        const computedResult = mk.mplus(st1, st2);
        expect(computedResult.content[0].sub.bindings[0][1], 5);
        expect(computedResult.content[0].counter, 1);
        expect(computedResult.content[1].sub.bindings[0][1], 6);
        expect(computedResult.content[1].counter, 1);
        expect(computedResult.content.length).toEqual(2);
    });
    it("with one argument beeing an empty stream", () => {
        const st1 = new mk.MkStream().extend(new mk.State(new mk.Substitution().extend(new mk.Var(0), 5), 1));
        const st2 = new mk.MkStream();
        const computedResult = mk.mplus(st1, st2);
        expect(computedResult.content[0].sub.bindings[0][1], 5);
        expect(computedResult.content.length).toEqual(1);
    });
    it("with immature Stream", () => {
        const st1 = new mk.MkStream((x) => equal(x, 2));
        const st2 = new mk.MkStream().extend(new mk.State(new mk.Substitution().extend(new mk.Var(0), 5), 1));
        const computedResult = mk.mplus(st1, st2);
        expect(computedResult.isImmature()).toEqual(true);
    });
});

describe("test disj", () => {
    it("disj 1", () => {
        const computedResult = mk.disj(
            mk.equal(new mk.Var(0), 5),
            mk.equal(new mk.Var(0), 6)
        )(new mk.State());
        expect(computedResult.content.length, 2);
    });
    it("disj 2", () => {
        const computedResult = mk.callFresh((b) => mk.disj(mk.equal(b, 5), mk.equal(b, 6)))(new mk.State());
        expect(computedResult.content.length, 2);
        expect(computedResult.content[0].sub.bindings[0][1], 5);
        expect(computedResult.content[1].sub.bindings[0][1], 6);
    });
});

describe("test conj", () => {
    it("simple", () => {
        const computedResult = mk.conj(mk.equal(new mk.Var(0), 5), mk.equal(new mk.Var(0), 6))(new mk.State());
        expect(computedResult.content.length, 0);
    });
    it("with callFresh", () => {
        const computedResult = mk.callFresh((b) => mk.conj(mk.equal(b, 5), mk.equal(b, 5)))(new mk.State());
        expect(computedResult.content.length, 1);
        expect(computedResult.content[0].sub.bindings[0][1], 5);
    });
    it("with difference", () => {
        const computedResult = mk.callFresh((b) => mk.conj(mk.equal(b, 5), mk.equal(b, 6)))(new mk.State());
        expect(computedResult.isEmpty(), true);
    })
});

describe("aAndB test", () => {
    const aAndB = mk.conj(
        mk.callFresh((a) => mk.equal(a, 7)),
        mk.callFresh((b) => mk.disj(mk.equal(b, 5), mk.equal(b, 6)))
    );

    function fives(x) {
        return mk.disj(mk.equal(x, 5), (ac) => {
            return new mk.MkStream().extend(() => fives(x)(ac));
        });
    }
    it("second-set t3", () => {
        const computedResult = aAndB(new mk.State());
        expect(computedResult.content.length, 2);
        expect(computedResult.content[0].sub.bindings[0][1], 7);
        expect(computedResult.content[0].sub.bindings[1][1], 5);
        expect(computedResult.content[0].counter, 2);
    });
    it("second-set t4", () => {
        const computedResult = aAndB(new mk.State());
        expect(computedResult.content.length, 2);
        expect(computedResult.content[1].sub.bindings[0][1], 7);
        expect(computedResult.content[1].sub.bindings[1][1], 6);
        expect(computedResult.content[1].counter, 2);
    });
    it("who cares", () => {
        const computedResult = mk.callFresh((q) => fives(q))(new mk.State());
        expect(computedResult.content[0].sub.bindings[0][1], 5);
        // force the immature stream
        expect(computedResult.content[1]().content[0].sub.bindings[0][1], 5);
        // is a function object
        expect(computedResult.content[1] instanceof Object, true);
    });
});