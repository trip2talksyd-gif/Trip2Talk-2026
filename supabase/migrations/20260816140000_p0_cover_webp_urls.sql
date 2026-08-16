-- Point live tour covers at P0 WebP derivatives. Originals stay in the bucket.

update public.tours
set cover_image_url = replace(
  cover_image_url,
  'Photos/Syd/cover/C9900955-Edit.jpg',
  'Photos/Syd/cover/C9900955-Edit_web.webp'
)
where cover_image_url like '%Photos/Syd/cover/C9900955-Edit.jpg%';

update public.tours
set cover_image_url = replace(
  cover_image_url,
  'Photos/Melbourne/cover/Mel04.jpg',
  'Photos/Melbourne/cover/Mel04_web.webp'
)
where cover_image_url like '%Photos/Melbourne/cover/Mel04.jpg%';

update public.tours
set cover_image_url = replace(
  cover_image_url,
  'Photos/Tasmania/Cover/490868468_1217905067001259_7839854174223812476_n.jpg',
  'Photos/Tasmania/Cover/490868468_1217905067001259_7839854174223812476_n_web.webp'
)
where cover_image_url like '%490868468_1217905067001259_7839854174223812476_n.jpg%';

update public.tours
set cover_image_url = replace(
  cover_image_url,
  'Photos/Tasmania/Cover/536122313_10238000037770173_4217421636888874064_n.jpg',
  'Photos/Tasmania/Cover/536122313_10238000037770173_4217421636888874064_n_web.webp'
)
where cover_image_url like '%536122313_10238000037770173_4217421636888874064_n.jpg%';
