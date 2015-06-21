var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.find(quizId).then (
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next (new Error ('No Existe quizId' + quizId));}
		}
		).catch(function(error) {next(error);});
};

// GET /quizes
exports.index = function(req, res){
	models.Quiz.findAll().then(function(quizes){
		res.render('quizes/index.ejs', {quizes: quizes, errors: []});
		}
	).catch(function(error) {next(error);})
};

// GET /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build( // crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);

	res.render('quizes/new', {quiz:quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res){
	var quiz = models.Quiz.build (req.body.quiz);

// guarda en BD los campos pregunta y respuesta de quiz
	quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz // save: guarda en BD los campos pregunta y respuesta de quiz
				.save ({fields: ["pregunta", "respuesta"]})
				.then ( function () {res.redirect('/quizes')})
			}		// res.redirect: Redirección HTTP a lista de preguntas
		}
	);
};

// GET /quizes/busqueda
exports.busqueda = function(req, res){
	// toma la query la preforma para la consulta con expresiones regulares
	var search = '%' + (req.query.search).replace(/ /g,'%') + '%';
	// ? se sustituye por search
	models.Quiz.findAll({where:['pregunta like?', search ], order : 'pregunta ASC'}).then(function(quizes){
	// pasa a vista la cadena buscada para mensaje
    	res.render( 'quizes/busqueda', {quizes: quizes, search: req.query.search, errors: []});
		}
	).catch(function(error) {next(error);})
};
// GET /quizes/:id
exports.show = function(req, res){
	res.render('quizes/show', {quiz: req.quiz, errors: []});	
};

// GET /quizes/:id/answer
exports.answer = function(req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
 	  	 resultado = 'Correcto';
 	 	  } 
  	 	 res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};
