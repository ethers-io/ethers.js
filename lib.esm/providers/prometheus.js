import { Pushgateway, Counter, Registry } from 'prom-client';
const registry = new Registry();
const requestCounter = new Counter({
    name: 'ethers_request_method_count',
    help: 'Count of ethers.js request methods executed',
    labelNames: ['method'] // Label to differentiate methods
});

// Register the counter
registry.registerMetric(requestCounter);
const pushgateway = new Pushgateway(process.env.PUSH_GATEWAY_LINK); // Replace with your Pushgateway address
async function pushMetrics() {
    try {
        await pushgateway.pushAdd({ jobName: 'ethers_cli_job', registry });
        console.log('Metrics pushed to Pushgateway.');
    } catch (err) {
        console.error('Error pushing metrics:', err);
    }
}

export async function _performPrometheus(req) {
    if (req && req.method) {
        requestCounter.labels(req.method).inc(); // Increment counter by 1
    }
    await pushMetrics();
}
