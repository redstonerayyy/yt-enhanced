# python download.py /path/to/export/file.json
import json, os, sys, subprocess, glob, time
from multiprocessing.pool import ThreadPool

def download(videoinfo):
    subprocess.run(['yt-dlp', videoinfo['videoid'], "-x"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

for file in glob.glob("*.part"):
    os.remove(file)

with open(sys.argv[1]) as file:
    data = json.load(file)
    with ThreadPool(processes=10) as pool:
        processing = pool.map_async(download, data['allvideos'])
        while not processing.ready():
            print(f"{processing._number_left} / {len(data['allvideos'])}", end="\r")
            time.sleep(0.25) 
        pool.close()
        pool.join()
