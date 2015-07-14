var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]
	}).then(function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next (new Error ('No Existe quizId' + quizId))}
		}
	).catch(function(error) {next(error)});
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
		{pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema"}
	);

	res.render('quizes/new', {quiz:quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res){
	var quiz = models.Quiz.build (req.body.quiz);

// guarda en BD los campos pregunta, respuesta y tema de quiz
	quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz // save: guarda en BD los campos pregunta, respuesta y tema de quiz
				.save ({fields: ["pregunta", "respuesta", "tema"]})
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

// GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz; // autoload de instancia de quiz
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz   //save: guarda campos pregunta, respuesta y tema en BD
				.save( {fields:["pregunta", "respuesta", "tema"]})
				.then( function(){res.redirect('/quizes');});
			}   // Redirección HTTP a lista de preguntas (URL relativo)			
		}
	);
};

// DELETE/quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function (error){next(error)});
};

// GET /quizes/statics
exports.statics = function (req, res) {
	var statics = {nQuizes:0,
					nComments: 0,
					avComments: 0,
				    noComments: 0,
				    withComments: 0};        // Inicializo las variables contadoras agrupadas en array
	var options = {include: [{all: true}]};  // preparo la consulta relacional

	models.Quiz.findAll(options).then(function(quizes){     

		statics.nQuizes = quizes.length;
		for (i in quizes){
			statics.nComments += quizes[i].Comments.length;
			if (quizes[i].Comments.length === 0) {
				statics.noComments += 1} else {statics.withComments += 1}
			}
			statics.avComments += statics.nComments/statics.nQuizes;
			var media = statics.avComments;
			statics.avComments = media.toFixed(2)
			res.render('quizes/statics.ejs', {statics: statics, errors:[]});
		}).catch(function(error) { next(error);})

};