document.addEventListener("DOMContentLoaded", function() {

    carregarRelatorio();
});

function carregarRelatorio() {

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        
        if (xhr.readyState === 4 && xhr.status === 200) {
            
            try {
                const veiculos = JSON.parse(xhr.responseText);
                
                construirTabela(veiculos);
            } catch (e) {
                console.error("Erro ao processar JSON:", e);
                exibirErro("Erro ao processar dados do servidor.");
            }

        } else if (xhr.readyState === 4) {
            console.error("Erro na requisição AJAX:", xhr.statusText);
            exibirErro(`Falha ao carregar dados. (Erro ${xhr.status})`);
        }
    };

    xhr.open("GET", "buscar_veiculos.php", true);

    xhr.send();
}

function construirTabela(veiculos) {
    const container = document.getElementById("relatorio-container");

    if (!veiculos || veiculos.length === 0) {
        container.innerHTML = "<p class='text-center text-gray-400'>Nenhum veículo cadastrado até o momento.</p>";
        return;
    }

    let tabelaHtml = `
        <table class="min-w-full table-auto border-collapse border border-gray-700">
            <thead class="bg-gray-700">
                <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Marca</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Modelo</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Placa</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Data de Cadastro</th>
                </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-700">
    `;

    veiculos.forEach(veiculo => {
        tabelaHtml += `
            <tr class="hover:bg-gray-700">
                <td class="px-4 py-3 whitespace-nowrap text-gray-200">${veiculo.marca}</td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-200">${veiculo.modelo}</td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-200">${veiculo.placa}</td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-300">${veiculo.data_cadastro}</td>
            </tr>
        `;
    });

    tabelaHtml += `
            </tbody>
        </table>
    `;

    container.innerHTML = tabelaHtml;
}

function exibirErro(mensagem) {
    const container = document.getElementById("relatorio-container");
    container.innerHTML = `<p class="text-center text-red-400 font-bold">${mensagem}</p>`;
}