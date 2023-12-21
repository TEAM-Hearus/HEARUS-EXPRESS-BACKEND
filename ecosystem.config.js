module.exports = {
    apps: [{
        name: 'hearus-backend',
        script: './app.js',
        instances: 1,
        exec_mode: 'cluster'
    }]
}