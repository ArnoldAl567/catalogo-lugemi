const {createClient}=require('@sanity/client');
const c=createClient({...require('../sanity.project.json'),useCdn:false});
c.fetch('{"products": *[_type == "product"]{name,audience}, "settings": *[_type == "storeSettings"]{name,whatsappNumber,email,instagramUrl}}').then(x=>console.log(JSON.stringify(x))).catch(e=>console.error(e.message));
