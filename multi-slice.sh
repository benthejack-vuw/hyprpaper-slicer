apply_transformations() {
    transform=$(echo $1 | jq -r '.transform')
    scale=$(echo $1 | jq -r '.scale')
    width=$(
        case $transform in
            0) echo $1 | jq '.width';;
            1) echo $1 | jq '.height';;
            2) echo $1 | jq '.width';;
            3) echo $1 | jq '.height';;
        esac
    )
    height=$(
        case $transform in
            0) echo $1 | jq '.height';;
            1) echo $1 | jq '.width';;
            2) echo $1 | jq '.height';;
            3) echo $1 | jq '.width';;
        esac
    )

    echo $1 | jq ".width = (($width/$scale)) | .height=(($height/$scale))"
}

total_size() {
    total_width=$(echo $1 | jq -r 'map(.width + .x) | max)')
    total_height=$(echo $1 | jq -r 'map(.height + .y) | add')
    echo "$total_width $total_height"
}

slice() {
    list=$(echo $1 | jq -rc ".[]")
    while IFS= read -r line; do
        echo "... $line ..."
    done <<< "$list"
}