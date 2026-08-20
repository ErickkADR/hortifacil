-- Sincroniza a galeria de fotos (imagens) dos 16 produtos que já existiam no banco.
-- Gerado em 20/08/2026 (fotos buscadas via Magnific/Freepik, licença free).
-- Rodar no SQL Editor do Supabase depois de aplicar o `alter table` do schema.sql.

update public.products set imagens = array['/images/produtos/tomate.png', '/images/produtos/tomate-2.jpg', '/images/produtos/tomate-3.jpg', '/images/produtos/tomate-4.jpg'] where id = 'tomate';
update public.products set imagens = array['/images/produtos/alface.png', '/images/produtos/alface-2.jpg', '/images/produtos/alface-3.jpg', '/images/produtos/alface-4.jpg'] where id = 'alface';
update public.products set imagens = array['/images/produtos/cenoura.png', '/images/produtos/cenoura-2.jpg', '/images/produtos/cenoura-3.jpg', '/images/produtos/cenoura-4.jpg'] where id = 'cenoura';
update public.products set imagens = array['/images/produtos/banana.png', '/images/produtos/banana-2.jpg', '/images/produtos/banana-3.jpg', '/images/produtos/banana-4.jpg'] where id = 'banana';
update public.products set imagens = array['/images/produtos/laranja.png', '/images/produtos/laranja-2.jpg', '/images/produtos/laranja-3.jpg', '/images/produtos/laranja-4.jpg'] where id = 'laranja';
update public.products set imagens = array['/images/produtos/maca.png', '/images/produtos/maca-2.jpg', '/images/produtos/maca-3.jpg', '/images/produtos/maca-4.jpg'] where id = 'maca';
update public.products set imagens = array['/images/produtos/batata.png', '/images/produtos/batata-2.jpg', '/images/produtos/batata-3.jpg', '/images/produtos/batata-4.jpg'] where id = 'batata';
update public.products set imagens = array['/images/produtos/pera.png', '/images/produtos/pera-2.jpg', '/images/produtos/pera-3.jpg', '/images/produtos/pera-4.jpg'] where id = 'pera';
update public.products set imagens = array['/images/produtos/uva.png', '/images/produtos/uva-2.jpg', '/images/produtos/uva-3.jpg', '/images/produtos/uva-4.jpg'] where id = 'uva';
update public.products set imagens = array['/images/produtos/brocolis.png', '/images/produtos/brocolis-2.jpg', '/images/produtos/brocolis-3.jpg', '/images/produtos/brocolis-4.jpg'] where id = 'brocolis';
update public.products set imagens = array['/images/produtos/pimentao.png', '/images/produtos/pimentao-2.jpg', '/images/produtos/pimentao-3.jpg', '/images/produtos/pimentao-4.jpg'] where id = 'pimentao';
update public.products set imagens = array['/images/produtos/manga.png', '/images/produtos/manga-2.jpg', '/images/produtos/manga-3.jpg', '/images/produtos/manga-4.jpg'] where id = 'manga';
update public.products set imagens = array['/images/produtos/morango.png', '/images/produtos/morango-2.jpg', '/images/produtos/morango-3.jpg', '/images/produtos/morango-4.jpg'] where id = 'morango';
update public.products set imagens = array['/images/produtos/abacaxi.png', '/images/produtos/abacaxi-2.jpg', '/images/produtos/abacaxi-3.jpg', '/images/produtos/abacaxi-4.jpg'] where id = 'abacaxi';
update public.products set imagens = array['/images/produtos/kiwi.png', '/images/produtos/kiwi-2.jpg', '/images/produtos/kiwi-3.jpg', '/images/produtos/kiwi-4.jpg'] where id = 'kiwi';
update public.products set imagens = array['/images/produtos/pessego.png', '/images/produtos/pessego-2.jpg', '/images/produtos/pessego-3.jpg', '/images/produtos/pessego-4.jpg'] where id = 'pessego';
