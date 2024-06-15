module.exports = function(app, pool) {

	app.post('/user', (req, res) => {
		const userRequest = {
			nome: req.body.nome,
			email: req.body.email,
			password: req.body.password,
            selfieLink: req.body.selfieLink ? req.body.selfieLink : null 
		};

		pool.query('INSERT INTO users (nome, email, password, selfie_link) VALUES ($1, $2, $3, $4) RETURNING id', [userRequest.nome, userRequest.email, userRequest.password, userRequest.selfieLink])
			.then((result) => {
				res.set('Content-Type', 'application/json');
				const userResponse = {
					...userRequest,
					id: result.rows[0].id
				};
				res.status(201).json({
					userResponse
				});
			})
			.catch((err) => {
				console.log(err);
				res.set('Content-Type', 'application/json');
				res.status(500).json({
					'error': 'An error has occurred',
				});
			});
	});

	app.get('/user/list', (req, res) => {
		const pageLimit = parseInt(req.query.pageLimit) || 10;
		const page = parseInt(req.query.page) || 1;
		const skipIndex = (page - 1) * pageLimit;
		// Substitua o find().skip(skipIndex).limit(pageLimit).toArray() pelo pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageLimit, skipIndex])
		pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageLimit, skipIndex])
			.then((result) => {
				const users = result.rows;
				res.set('Content-Type', 'application/json');
				res.status(200).json(users);
			})
			.catch((err) => {
				console.error('Error fetching users:', err);
				res.set('Content-Type', 'application/json');
				res.status(500).json({
					'error': 'An error has occurred'
				});
			});
	});

	app.post('/user/update', (req, res) => {
		const idUserUpdate = req.query.id;
		let userRequest = {
			nome: req.body.nome,
			email: req.body.email,
			password: req.body.password,
            selfieLink: req.body.selfieLink,
			membroAtivo: req.body.membroAtivo
		};

		pool.query('SELECT * FROM users WHERE id = $1', [idUserUpdate])
			.then((result) => {
				const user = result.rows[0];
				userRequest.nome = userRequest.nome ? userRequest.nome : user.nome;
				userRequest.email = userRequest.email ? userRequest.email : user.email;
				userRequest.password = userRequest.password ? userRequest.password : user.password;
                userRequest.selfieLink = userRequest.selfieLink ? userRequest.selfieLink : user.selfie_link
				userRequest.membroAtivo = userRequest.membroAtivo !== undefined ? userRequest.membroAtivo : user.membro_ativo;

				pool.query('UPDATE users SET nome = $1, email = $2, password = $3, membro_ativo = $4, selfie_link = $5 WHERE id = $6', [userRequest.nome, userRequest.email, userRequest.password, userRequest.membroAtivo, userRequest.selfieLink, idUserUpdate])
					.then((result) => {
						res.set('Content-Type', 'application/json');
						const userResponse = {
							...userRequest,
							id: idUserUpdate
						};
						res.status(201).json({
							userResponse
						});
					})
					.catch((err) => {
						console.log(err);
						res.set('Content-Type', 'application/json');
						res.status(500).json({
							'error': 'An error UPDATE has occurred',
						});
					});
			})
			.catch((err) => {
				console.log(err);
				res.set('Content-Type', 'application/json');
				res.status(500).json({
					'error': 'An error catch user has occurred',
				});
			});
	});

	app.delete('/user', (req, res) => {
		const idUser = req.query.id;

		pool.query('DELETE FROM users WHERE id = $1', [idUser])
			.then(() => {
				res.set('Content-Type', 'application/json');
				res.status(204).send();
			})
			.catch((err) => {
				console.error('Error delete user:', err);
				res.set('Content-Type', 'application/json');
				res.status(500).json({
					'error': 'An error DELETE has occurred'
				});
			});
	})


	// Add error handling middleware
	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.set('Content-Type', 'application/json');
		res.status(500).json({
			'error': 'An error has occurred'
		});
	});
};