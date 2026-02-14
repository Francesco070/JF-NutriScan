Enter database

```bash
docker exec -it backend-db-1 psql -U jf -d nutriscan
```

List database tables

```bash
\dt public.*;
```

Make the output readable

```bash
\x on
```

Note: SQL statements must end with ;
