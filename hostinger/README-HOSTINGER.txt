MAIA BALLOONS - PACOTE HOSTINGER

1. No hPanel, abra Arquivos > Gerenciador de arquivos.
2. Acesse public_html (ou a pasta do domínio).
3. Envie todo o conteúdo de hostinger/public_html para essa pasta.
4. No Gerenciador, selecione public_html/data, products.js e config.js e confirme permissões 755 para pasta e 644 para arquivos.
5. Se o upload de imagens não funcionar, selecione public_html/uploads e defina 755.
6. Abra o domínio; o site ficará na raiz.
7. Abra dominio/painel/ para administrar produtos.

O backend funciona em PHP e armazena dados em data/catalog.json. Itens novos ficam públicos somente depois que Salvar alterações é usado.
Não envie mais de um index.html para a raiz.

Segurança: proteja a pasta painel pelo recurso de Diretório protegido por senha do hPanel, pois este pacote não inclui autenticação própria.

No painel, deixe PHP ativo e mod_rewrite/liberação de .htaccess ativa. A Hostinger usa Apache, permitindo os rewrites do arquivo .htaccess incluído.
