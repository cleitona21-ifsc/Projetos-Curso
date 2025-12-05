<?php

require_once 'config.php';

$veiculos = [];

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha na conexão com o banco de dados.']);
    exit;
}

$sql = "SELECT marca, modelo, placa, data_cadastro FROM veiculos";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $veiculos[] = $row;
    }
} 

$conn->close();

header('Content-Type: application/json');

echo json_encode($veiculos);

?>