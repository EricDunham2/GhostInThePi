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

type Result struct {
	err interface{}
	data interface{}
}

var (
	router *mux.Router
)

func main() {
	router = mux.NewRouter()
	fmt.Println("[" + ft(time.Now()) + "] " + "Running main")

	init_routes()

	err := http.ListenAndServe(":5000", router)
	fmt.Println("[" + ft(time.Now()) + "] " + string(err.Error()))
}

func init_routes() {
	fmt.Println("[" + ft(time.Now()) + "] " + "Creating routes")

	resources := packr.NewBox("./static")
	views := packr.NewBox("./src/views")

	router.PathPrefix("/static").Handler(http.StripPrefix("/static/", http.FileServer(resources)))
	router.PathPrefix("/templates").Handler(http.StripPrefix("/templates/", http.FileServer(views)))

	//base := views.String("/base.html")
	//cubert := views.String("/cubert/cubert.html")
	//media := views.String("/media/media.html")
	//home := views.String("/home/home.html")

	router.HandleFunc("/home/getMacAddr", getMacAddr).Methods("GET")
	router.HandleFunc("/home/getIpAddr", getIpAddr).Methods("GET")
	router.HandleFunc("/media/findMedia", FindMedia).Methods("POST")

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/base.html","./src/views/home/home.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			fmt.Println(err)
			return
		}

		log_request(r)
		i.ExecuteTemplate(w, "baseHTML", "")
	})

	router.HandleFunc("/CUBErt", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/base.html","./src/views/cubert/cubert.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			fmt.Println(err)
			return
		}

		log_request(r)
		i.ExecuteTemplate(w, "baseHTML", "")
	})

	router.HandleFunc("/media", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/base.html","./src/views/media/media.html"}
		i, err := template.New("").ParseFiles(tmpl...)

		if err != nil {
			fmt.Println(err)
			return
		}

		log_request(r)
		i.ExecuteTemplate(w, "baseHTML", "")
	})

	router.HandleFunc("/camera", func(w http.ResponseWriter, r *http.Request) {
		tmpl := []string{"./src/views/base.html","./src/views/camera/camera.html"}
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

	log_request(r)

	filters := []string{".mp4", ".avi"}
	data, _ := Search(path,filters)

	//media := packr.NewBox(path)

	fs := http.FileServer(http.Dir(path))

	//http.Handle("/video/", http.StripPrefix("/video", fs))
	router.PathPrefix("/video").Handler(http.StripPrefix("/video/",fs))

	fmt.Println(fs)

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
	ifaces, _ := net.Interfaces()
	var ip net.IP

	for _, iface := range ifaces {

		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}

		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}

		addrs, _ := iface.Addrs()

		for _, addr := range addrs {
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
		}
	}

	ret, _ := json.Marshal(ip.String())

	w.Header().Set("Content-Type", "application/json")
	w.Write(ret)
}
/******** End Networking ********/



/************* Helpers **********/
func filename(path string) string {
	parts := strings.Split(path, "\\")
	return parts[len(parts)-1]
}
