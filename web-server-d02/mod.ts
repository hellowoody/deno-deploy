import {serve,ServerRequest} from "https://deno.land/std@0.103.0/http/server.ts";
import {serveFile} from "https://deno.land/std@0.103.0/http/file_server.ts";
import {readAll} from "https://deno.land/std@0.103.0/io/util.ts";

const server = serve({port:8080});
console.log(`http server running , access it at: http://localhost:8080/ `);

async function fileExists(path: string) {
    try {
      const stats = await Deno.lstat(path);
      return stats && stats.isFile;
    } catch(e) {
      if (e && e instanceof Deno.errors.NotFound) {
        return false;
      } else {
        throw e;
      }
    }
}

const serveAssets = async (req:ServerRequest,staticPath:string) : Promise<boolean> => {
    const path = `${Deno.cwd() + staticPath +req.url}`;
    if (await fileExists(path)) {
        const content = await serveFile(req, path);
        req.respond(content);
        return true
    }
    return false
}

const parseRequset = async (request:ServerRequest) => {
    let body:Record<string,string> = {};
    const contextType = request.headers.get("content-type");
    console.log("req context-type : ",contextType)
    // const buf = new Buffer();
    // await Deno.copy(request.body, buf);
    // const reader = buf

    const reader = request.body
    if(reader){
        const raw = await readAll(reader)
        // const raw = reader.bytes()
        switch(contextType){
            case 'application/x-www-form-urlencoded':
                const bodyParams = new URLSearchParams(new TextDecoder().decode(raw));
                for(const [k,v] of bodyParams){
                    body[k]=v
                }
                break;
            case 'application/json':
            default:
                body = Object.assign({},body,JSON.parse(new TextDecoder().decode(raw)));
                break;
        }
    }
    return {
        body
    }
}

const handle = async (req:ServerRequest) => {
    switch(req.method){
        case 'POST':
            // console.log(req)
            const res = await parseRequset(req)
            console.log(res)
            break;
        case 'GET':
        default:
            let pathname = req.url,
                param = "",
                index = req.url.indexOf("?");
            if(index>= 0){
                pathname = req.url.substr(0,index);
                param = req.url.substr(index+1);
            }
            console.log(req.url.substr(0,req.url.indexOf("?")))
            const flag = await serveAssets(req,"/assets")
            if(!flag){
                switch(pathname){
                    case "/" :
                        let body:Record<string,string> = {};
                        // console.log(new URLSearchParams(param))
                        const bodyParams = new URLSearchParams(param);
                        for(const [k,v] of bodyParams){
                            body[k]=v
                        }
                        console.log(body)
                        req.respond({ body:JSON.stringify(body)});
                        break;
                    default:
                        req.respond({body:"not found"})
                        break; 
                }
            }
            break;
    }
}
  

for await(const req of server) {
    handle(req)
}