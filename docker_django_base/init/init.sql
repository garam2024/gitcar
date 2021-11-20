alter role gaic set client_encoding to 'utf-8'; 
ALTER role gaic set default_transaction_isolation to 'read committed';
alter role gaic set timezone to 'Asia/Seoul'; 
grant all privileges on database gaic_db to gaic; 
