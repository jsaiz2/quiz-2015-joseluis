// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/login');
	}
};

// GET /login -- Formulario de login
exports.new = function(req,res) {
	var errors = req.session.errors || {};
	req.session.errors = {};

	res.render('sessions/new', {errors: errors});
};

// POST /login -- Crear la sesión
exports.create = function(req, res) {
	
	var login = req.body.login;
	var password = req.body.password;
	var userController = require('./user_controller');
	userController.autenticar(login, password, function(error, user) {
		if (error) {	// si hay error retornamos mensajes de error de sesión
			req.session.errors = [{"message": 'Se ha producido un error: '+ error}];
			res.redirect('/login');
			return;
		}

		// Crear req.session.user y guardar campos id y username
		// La sesión se define por la existencia de: req.session.user
		req.session.user = {id:user.id, username:user.username};

		res.redirect(req.session.redir.toString()); // redirección a path anterior a login
	});
};

// DELETE /logout  -- Destruir sesión
exports.destroy = function(req, res) {
	delete req.session.user;
	res.redirect(req.session.redir.toString()); // redirección a path anterior a login
};

// AutoLogout
exports.autoLogout = function( req, res, next) {

	if (req.session.user) {
		var lastTime = req.session.lastTime || Date.now(); // Consulto si existe la  propiedad tiempo e inicializo variable tiempo
		req.session.lastTime = lastTime;                   // redefino la propiedad tiempo de sesión
		var nowTime = Date.now();                          // defino tiempo actual
			if (nowTime - lastTime > 120000) {
				req.session.errors = [{"message": 'Timeout: Han pasado más de 2 minutos sin actividad. Debe registrarse otra vez. '}];
				delete req.session.user;                   // cierra la sesión borrando la variable
				delete req.session.lastTime;			   // elimino la propiedad lastTime para inicializar o bien	
				//req.session.lastTime = nowTime;		   // reinicio el contador. Ambos métodos valen
				res.redirect('/login');                    // redirección a la pantalla de registro
			
			};
			req.session.lastTime = nowTime;
	}
	next();
};