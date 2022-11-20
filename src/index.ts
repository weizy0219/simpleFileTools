import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
const AdmZip=require('adm-zip');
const fileList:string[]=[];

//读取路径字符串并返回包含路径的数字
//如果路径不存在则返回空数组
//如果路径是文件，则返回仅包含该文件的列表
//如果路径是目录，则返回该目录下所有文件（不含嵌套文件夹）的文件列表
function listFiles(routeString:string){
    if(fs.existsSync(routeString)){
        if(fs.lstatSync(routeString).isFile())
        {
            fileList.push(routeString);
        }else if(fs.lstatSync(routeString).isDirectory()){
            const fileArray=fs.readdirSync(routeString);
            fileArray.forEach((fileName)=>{
                // const rt:string=routeString+'\\'+fileName;
                const rt=path.join(routeString,fileName);
                // console.log(fs.lstatSync(rt).isFile());
                if(fs.lstatSync(rt).isFile()){
                    fileList.push(rt);
                }else if(fs.lstatSync(rt).isDirectory()){
                    listFiles(rt);
                }
            })
        }
    }
    return fileList;
}


//从文件路径字符串读取文件并返回文件Buffer
function readFileFromString(fileString:string):Buffer{
    if(fs.existsSync(fileString)){
        return fs.readFileSync(fileString);
    }else{
        return Buffer.from('');
    }
}

//计算文件Buff的MD5值
function buffMD5(fileBuff:Buffer){
    const hash=crypto.createHash('md5').update(fileBuff).digest('hex')
    return hash;
}

//选择路径字符串并计算md5值
function mainFuncMd5(argString:string){
    const files=listFiles(argString);
    files.forEach(file=>{
        console.log(file);
        const md5=buffMD5(readFileFromString(file));
        console.log(md5);
    })
}

//解压缩
function mainFuncUnzip(argString:string,password:string=''){
    const files=listFiles(argString);
    if(files.length>=1){
        const extractDir=files[0].slice(0,files[0].lastIndexOf('\\')+1);
        console.log(extractDir);
        files.forEach(file=>{
            console.log(file);
            const zip=new AdmZip(file);
            // const zipEntries = zip.getEntries(); 
            (password==='')
            ?zip.extractAllTo(path.format(path.parse(extractDir)),true)
            :zip.extractAllTo(path.format(path.parse(extractDir)),true,password);;
        })
    }
}

//删除
function mainFuncDel(argString:string,identifier:string='none',delimitor:string='none'){
    const files=listFiles(argString);
    let totalDel=0;
    files.forEach(file=>{
        const filePath=path.parse(file);
        console.log(file);
        if(identifier==='all'){
            console.log('all files to be deleted');
            fs.unlinkSync(file);
            ++totalDel;
        }else if(identifier==='start'){
            if(filePath.name.startsWith(delimitor)){
                console.log(`file starts with ${delimitor} will be deleted`);
                fs.unlinkSync(file);
                ++totalDel;
            }
        }else if(identifier==='include'){
            if(filePath.name.includes(delimitor)){
                console.log(`file name containts ${delimitor} will be deleted`);
                fs.unlinkSync(file);
                ++totalDel;
            }
        }else if(identifier==='ext'){
            if(filePath.ext===delimitor){
                console.log(`file with extention of ${delimitor} will be deleted`);
                fs.unlinkSync(file);
                ++totalDel;
            }
        }
    });
    console.log(`共删除了${totalDel}个文件` );
}
//重命名
function mainFuncRename(argString:string ,originName:string,newName:string=''){
    const files=listFiles(argString);
    let totalRename=0;
    files.forEach(file=>{
        const filePath=path.parse(file);
        if(filePath.name.includes(originName)){
            console.log(`${file}`);
            const newFilename=filePath.name.replace(originName,newName);
            fs.renameSync(path.join(filePath.dir,filePath.name+filePath.ext),
                path.join(filePath.dir,newFilename+filePath.ext));
            console.log('file renamed');
            ++totalRename;
        }
    })
    console.log(`共重命名了${totalRename}个文件`);
}

if(process.argv.length>=4){
    // console.log(checkFileType(process.argv[2]));
    // console.log(listFiles(process.argv[2]));
    // console.log(process.cwd());
    const cmd=process.argv[3];
    const argString=path.normalize(process.argv[2]);
    const distPath=path.parse(process.argv[2]);
    // console.log(distPath);
    if(cmd==='md5')
    {
        mainFuncMd5(argString);
        // console.log(listFilesFromPath(distPath));
        // console.log(listFiles(argString));
    }else if(cmd==='unzip'){
        // console.log(typeof process.argv[4]);
        if(process.argv.length===4){
            mainFuncUnzip(argString)
        }else{
            mainFuncUnzip(argString,process.argv[4]);
            }
    }else if(cmd==='del'){
        if(process.argv.length<5){
            console.log('删除文件或目录需要传递参数all start include或ext');
            console.log('除了参数all外，其余参数还需要添加删除字符串');
            console.log('例如npm run start d:\\testfolder\\ del start todel')
            console.log('如果要删除某个扩展名，需要包含扩展名前的.，例如 .png')
        }else{
            mainFuncDel(argString,process.argv[4],process.argv[5]?process.argv[5]:'*')
        }
    }else if(cmd==='rename'){
        if(process.argv.length<5){
            console.log('重命名需要输入文件名包含的字符串以及要替换的字符串');
            console.log('输入""代表空字符串');
        }else{
            mainFuncRename(argString,process.argv[4],process.argv[5]);
        }
    }
    else{
        console.log(`命令 ${cmd} 尚不支持`);
    }
}else{
    console.log('参数数量错误，请输入需要计算md5的文件夹或文件路径，及功能命令 md5=计算md5,unzip=解压缩文件');
    console.log('参考格式1： node index.js <dir> md5');
    console.log('参考格式1： node index.js <dir/filename> unzip');
    console.log('请重新运行程序');
    process.exit(0);
}