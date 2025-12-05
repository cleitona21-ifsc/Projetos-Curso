<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Processando Cadastro...</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style> body { font-family: 'Inter', sans-serif; } </style>
</head>
<body class="bg-gray-900 text-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
<?php

require_once 'config.php';

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD);

if ($conn->connect_error) {
    die("<p class='text-red-500 font-bold'>Falha na conexão: " . $conn->connect_error . "</p></div></body></html>");
}

$sql_create_db = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if (!$conn->query($sql_create_db)) {
    die("<p class='text-red-500 font-bold'>Erro ao criar o banco de dados: " . $conn->error . "</p></div></body></html>");
}

$conn->select_db(DB_NAME);

$sql_create_table = "
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255),
    email VARCHAR(100) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- Armazenará o hash da senha
    celular VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if (!$conn->query($sql_create_table)) {
    die("<p class='text-red-500 font-bold'>Erro ao criar a tabela 'clientes': " . $conn->error . "</p></div></body></html>");
}

$nome = $_POST['nome'];
$endereco = $_POST['endereco'];
$email = $_POST['email'];
$username = $_POST['username'];
$senha = $_POST['senha'];
$celular = $_POST['celular'];

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO clientes (nome, endereco, email, username, senha, celular) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $nome, $endereco, $email, $username, $senha_hash, $celular);

if ($stmt->execute()) {
    echo "<h2 class='text-2xl font-bold mb-4 text-green-400'>Cliente cadastrado com sucesso!</h2>";
    echo "<a href='index.html' class='text-blue-400 hover:text-blue-300'>Voltar à página inicial</a>";
} else {
    echo "<h2 class='text-2xl font-bold mb-4 text-red-400'>Erro ao cadastrar cliente.</h2>";
    echo "<p class='text-gray-400'>Possívelmente o E-mail ou Nome de Usuário já existem.</p>";
    echo "<p class='text-gray-500 text-sm mt-2'>Erro: " . $stmt->error . "</p>";
    echo "<a href='cliente.html' class='text-blue-400 hover:text-blue-300 mt-4 block'>&larr; Tentar novamente</a>";
}

$stmt->close();
$conn->close();
?>
    </div>
</body>
</html>