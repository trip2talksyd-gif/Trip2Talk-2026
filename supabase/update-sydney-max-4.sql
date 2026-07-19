-- Sydney trips: Tesla Model Y — max 4 guests per trip
update public.tours
set max_pax = 4
where trip_code like 'SYD%';
