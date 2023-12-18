const app = require('./app');

app.listen(app.get('port'), () => {
    console.log('Server is listening at ', app.get('port'));
});
