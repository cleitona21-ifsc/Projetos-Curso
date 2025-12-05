<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';


$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
   
    $conn_init = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD);
    $conn_init->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
    $conn_init->close();
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
}


$sql_create_table = "
CREATE TABLE IF NOT EXISTS veiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql_create_table);



$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);


if (is_null($data)) {
    $data = $_POST;
}


if (empty($data['marca']) || empty($data['modelo']) || empty($data['placa'])) {
    http_response_code(400);
    echo json_encode(["mensagem" => "Dados incompletos.", "debug" => $data]);
    exit;
}

$marca = $data['marca'];
$modelo = $data['modelo'];
$placa = $data['placa'];

$stmt = $conn->prepare("INSERT INTO veiculos (marca, modelo, placa) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $marca, $modelo, $placa);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(["mensagem" => "Veículo cadastrado com sucesso!"]);
} else {
    http_response_code(500);
    echo json_encode(["mensagem" => "Erro ao cadastrar: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>