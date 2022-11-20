const AdmZip=require('adm-zip');
const zip=new AdmZip("E:\\Downloads\\C&C++\\HTTP权威指南.zip");
// const zipEntries = zip.getEntries(); 

zip.extractAllTo(/*target path*/'E:\\Downloads\\C&C++\\', /*overwrite*/true);