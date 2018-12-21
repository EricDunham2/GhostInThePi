package main
//Potentiall move all templates to static to get partials to work
import (
	"html/template"
	"net/http"
	"fmt"
	"time"
	"encoding/json"
	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	"os"
	"net"
	"io/ioutil"
	"path/filepath"
	"strings"
)

var (
	router *mux.Router
)

func main() {
	router = mux.NewRouter()
	init_routes()

	http.ListenAndServe(":5000", router)
	fmt.Println("Listening");
}

func init_routes() {
	resources := packr.NewBox("./src/static")
	views := packr.NewBox("./src/views")

	router.PathPrefix("/static").Handler(http.StripPrefix("/static/", http.FileServer(resources)))
	router.PathPrefix("/templates").Handler(http.StripPrefix("/templates/", http.FileServer(views)))

	router.HandleFunc("/config",Defaults).Methods("GET")
	router.HandleFunc("/getMacAddr", getMacAddr).Methods("GET")
	router.HandleFunc("/getIpAddr", getIpAddr).Methods("GET")
	router.HandleFunc("/media/findMedia", FindMedia).Methods("POST")

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/app.html","./src/views/home/home.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			fmt.Println(err)
			return
		}

		log_request(r)
		i.ExecuteTemplate(w, "baseHTML", "")
	})

	router.HandleFunc("/CUBErt", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/app.html","./src/views/cubert/cubert.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			fmt.Println(err)
			return
		}

		log_request(r)
		i.ExecuteTemplate(w, "baseHTML", "")
	})

	router.HandleFunc("/media", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/app.html","./src/views/media/media.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			fmt.Println(err)
			return
		}

		log_request(r)
		i.ExecuteTemplate(w, "baseHTML", "")
	})

	router.HandleFunc("/camera", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/app.html","./src/views/camera/camera.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			fmt.Println(err)
			return
		}

		log_request(r)
		i.ExecuteTemplate(w, "baseHTML", "")
	})
}


/************* Logging *****************/
func ft(t time.Time) string {
	hour := t.Hour()
	min := t.Minute()
	sec := t.Second()

	output := fmt.Sprintf("%d:%d:%d",
		hour,
		min,
		sec)

	return output
}

func log_request(request *http.Request) {
	fmt.Println("[" + ft(time.Now()) + "] " + request.RemoteAddr + " " + request.Referer())
}
/*****************************************/



/**************** Media ******************/
func FindMedia(w http.ResponseWriter, r *http.Request) {
	body, _ := ioutil.ReadAll(r.Body)
	path, _ := filepath.Abs(string(body[:]))
		
	filters := []string{".mp4", ".avi", ".wmv"}
	data, _ := Search(path, filters)

	fs := http.FileServer(http.Dir(path))
	router.PathPrefix("/video").Handler(http.StripPrefix("/video/", fs))

	re, _ := json.Marshal(data)

	w.Header().Set("Content-Type", "application/json")
	w.Write(re)
}

type Branch struct {
	Name string `json:name`
	Path string `json:path`
	parent *Branch
	Nodes []Node `json:nodes`
	Branches []Branch `json:branches`
}

type Node struct {
	Name string `json:name`
	Path string `json:path`
	Video string `json:video`
}

func (branch *Branch) addBranch(b Branch) []Branch{
	branch.Branches = append(branch.Branches, b)
	return branch.Branches
}

func Build(root string, filters []string) string {
	root, _ = filepath.Abs(root)

	var rootBranch Branch = Branch{Name: pathName(root),Path: root, Branches:  []Branch{}}	
	var branchLookup map[string]*Branch = make(map[string]*Branch)

	rootBranch.Nodes = getDirFiles(root, root)
	branchLookup[root] = &rootBranch

	filepath.Walk(root, func(p string, info os.FileInfo, err error) error {
		p ,_ = filepath.Abs(p)

		if (p == root) { return nil }
		
		if info.IsDir() {

			lookup, _ := filepath.Abs(filepath.Dir(p))
			currBranch := branchLookup[lookup]

			b := Branch{Name: pathName(p),Path: p, Branches: []Branch{}}	
			b.Nodes = getDirFiles(p, root)
			
			currBranch.addBranch(b)
			
			for i := 0; i < len(currBranch.Branches); i++ {
				if (currBranch.Branches[i].Path != b.Path)  { continue }
				branchLookup[p] = &currBranch.Branches[i]
			}

		}
		return nil
	})

	j ,_ := json.Marshal(rootBranch)
	return string(j)
}


//TODO use array for extensions
func getDirFiles(path string, root string) []Node {
	var fname []Node

	files, _ := ioutil.ReadDir(path)

	for _, file := range files {
		if (file.IsDir()) { continue }


		var fp string = ""

		if strings.HasSuffix(path, "\\") {
			fp = path + file.Name()
			fp, _ = filepath.Abs(fp)
		} else { 
			fp = path + "\\" + file.Name()
			fp, _ = filepath.Abs(fp)
		}

		if(filepath.Ext(fp) != ".mp4") { continue }

		videoPath := strings.Replace(fp, root, "/video/", 1)
		videoPath = strings.Replace(videoPath, "\\", "/", -1)

		n := Node{Name:file.Name(), Path:fp, Video:videoPath }

		fname = append(fname, n)
	}

	return fname
}


func Search(path string, filter []string) (string, error) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", err
	}
	
	data := Build(path, filter)

	return data, nil
}

func pathName(path string) string {
	parts := strings.Split(path, "\\")
	return parts[len(parts)-1]
}
/********* End Media ********/


/******** Move to Networking.go ********/
func getMacAddr(w http.ResponseWriter, r *http.Request) {
	ifas, _ := net.Interfaces()
	
    var as []string
    for _, ifa := range ifas {
        a := ifa.HardwareAddr.String()
        if a != "" {
            as = append(as, a)
        }
	}
	
	ret, _ := json.Marshal(as[0])

	w.Header().Set("Content-Type", "application/json")
	w.Write(ret)
}

func getIpAddr(w http.ResponseWriter, r *http.Request) {
	conn, _ := net.Dial("udp", "8.8.8.8:80")

	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)

	ret, _ := json.Marshal(localAddr.IP.String())

	w.Header().Set("Content-Type", "application/json")
	w.Write(ret)
}
/******** End Networking ********/

/************* Helpers **********/
func filename(path string) string {
	parts := strings.Split(path, "\\")
	return parts[len(parts)-1]
}

func Defaults(w http.ResponseWriter, r *http.Request) {
	data, _ := ioutil.ReadFile("./src/static/configs/config.json") 
	w.Write(data)
}