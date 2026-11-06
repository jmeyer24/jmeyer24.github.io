class VectorField {
    constructor(name) {
        this.name = name;
    }
    sample(x, y, t) { throw new Error("needs to be implemented"); }
}

class DuffingOscillator extends VectorField {
    constructor() {
        super("Forced-Damped Duffing Oscillator");
        this.sampleValues = {
            alpha: -0.25,
            beta: 0.4,
        }
    }
    sample(x, y, t) {
        //from https://cgl.ethz.ch/research/visualization/data.php
        // https://cgl.ethz.ch/research/visualization/code/forceddampedduffing2d.py
        let alpha = this.sampleValues.alpha;
        let beta = this.sampleValues.beta;

        let u = y;
        let v = alpha * y - Math.pow(x, 3) + x + beta * Math.cos(t);
        return [u, v];
    }
}

class DoubleGyre extends VectorField {
    constructor() {
        super("Double DoubleGyre");
        this.sampleValues = {
            A: 0.1,
            omega: Math.PI / 5.0,
            epsilon: 0.25,
        }
    }
    sample(x, y, t) {
        let A = this.sampleValues.A;
        let omega = this.sampleValues.omega;
        let epsilon = this.sampleValues.epsilon;

        let u = -A * Math.PI * Math.sin(Math.PI * (epsilon * Math.sin(omega * t) * x * x + (1 - 2 * epsilon * Math.sin(omega * t)) * x)) * Math.cos(Math.PI * y);
        let v = A * Math.PI * (2 * epsilon * Math.sin(omega * t) * x - 2 * epsilon * Math.sin(omega * t) + 1) * Math.cos(Math.PI * (epsilon * Math.sin(omega * t) * x * x + (1 - 2 * epsilon * Math.sin(omega * t)) * x)) * Math.sin(Math.PI * y);
        return [u, v];
    }
}

export { DuffingOscillator, DoubleGyre };