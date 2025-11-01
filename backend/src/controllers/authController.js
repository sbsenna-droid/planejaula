// authController.js

const login = (req, res) => {
    console.log('Controller de login acessado.');
    res.status(200).send('Endpoint de Login Funcionando');
};

// Exporta a função para que outros arquivos possam importá-la
module.exports = {
    login
};