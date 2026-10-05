#!/bin/zsh
cd -- "${0:A:h}" || exit 1
print 'Abra http://127.0.0.1:8741 no navegador. Mantenha esta janela aberta.'
python3 -m http.server 8741 --bind 127.0.0.1
