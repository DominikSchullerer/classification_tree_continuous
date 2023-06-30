let maxDepth = 5
let ratio = 0


/* Leaf of the decision tree */
class Leaf {
    constructor(decision, samples) {
        /* Final decision */
        this.decision = decision
        this.samples = samples
    }
}

/* Node of the decision tree */
class Node {
    constructor(attribute, attributeValue, children, attributeIndex) {
        /* Attribute of the next decision */
        this.attribute = attribute
        this.attributeValue = attributeValue
        this.children = children
        this.attributeIndex = attributeIndex
    }
}

/*
Looks for the most informative attribute in a list of samples.
Input: Array of samples
Output: Index of the most informative attribute
*/
function mostInformativeAttribute(samples) {
    /* Initialization. 5 is a upper limit for the calculated entropy */
    let size = samples.length
    let entropy = 5
    let attributeNumber = samples[0].length - 1
    let bestAttributeIndex = NaN
    let bestAttributeValue = NaN

    /* Iterate over all attibutes */
    for (let i = 0; i < attributeNumber; i++) {
        for (let j = 0; j < size; j++) {
            let attributeValue = parseFloat(samples[j][i])

            /* Update the index if the current index is more informative */
            let nextEntropy = totalEntropyOfAttribute(samples, i, attributeValue)
            if (nextEntropy < entropy) {
                entropy = nextEntropy
                bestAttributeIndex = i
                bestAttributeValue = attributeValue
            }
        }
    }

    /* Return the index of the most informative attribute */
    return [bestAttributeIndex, bestAttributeValue]
}

/*
Calculate the total entropy for samples after using an attribute for classification.
Input: Array of samples, Index of the used attribute
Output: Calculated Entropy
*/
function totalEntropyOfAttribute(samples, attrIndex, attrLimit) {
    /* Initialization */
    let size = samples.length
    
    let smallerList = []
    let largerList = []
    
    samples.forEach(sample => {
        if (parseFloat(sample[attrIndex]) <= attrLimit) {
            smallerList.push(sample)
        } else {
            largerList.push(sample)
        }
    });
    
    /* Calculate the entropy */
    let entropy = 0
    entropy += (smallerList.length / size) * entropyOf(smallerList)
    entropy += (largerList.length / size) * entropyOf(largerList)

    /* Return the output value */
    return entropy
}

/*
Looks for the most frequent value in an array
Input: Array
Output: Most frequent value
*/
function getMostFrequent(arr) {
    /* Create a map of all values in the input array*/
    let map = arr.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1
        return acc
    }, {})

    /* Determine the most common value und return it */
    return Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b)
}

/*
Calculates the entropy of an array of Samples.
Input: Array of samples
Output: Entropy 
*/
function entropyOf(samples) {
    /* Initialization */
    let size = samples.length
    let entropy = 0
    let valueKeys = []
    let valueDistribution = {}

    /* Create a list of all final decisions present in samples */
    samples.forEach(sample => {
        if (!valueKeys.includes(sample.at(-1))) {
            valueKeys.push(sample.at(-1))
        }
    });
    valueKeys.sort()

    /* Create a dictionary using valueKeys and their frequency in samples */
    valueKeys.forEach(key => {
        valueDistribution[key] = 0

        samples.forEach(sample => {
            if (sample.at(-1) == key) {
                valueDistribution[key] += 1
            }
        });
    });

    /* Calculate the entropy */
    for (const key in valueDistribution) {
        let freq = valueDistribution[key]
        entropy -= (freq / size) * Math.log2(freq / size)
    }

    /* Return output */
    return entropy
}

/*
Checks if all input samples lead to the same decision
Input: Array of samples
Output: True if all samples lead to the same decision; False if not
*/
function areSameDecision(samples) {
    /* Initialization */
    let areSameDecision = true
    let decision = samples[0].at(-1)

    /* Set the output variable to false if any decision differs from the first one */
    samples.forEach(sample => {
        if (sample.at(-1) !== decision) {
            areSameDecision = false
        }
    });

    /* Return the output variable */
    return areSameDecision
}

/*
Creates a decision tree. Recursive.
Input: Array of samples, array of attributes, String containing the previous Decision
Output: Node that is the root of the decision tree
*/
function decisionTree(samples, attributes, depth = 0) {
    /* Basecase: All samples are of the same class */
    if (areSameDecision(samples) || depth == maxDepth) {
        /* Create a Leaf using the common class */
        let decision = samples[0].at(-1)
        return new Leaf(decision, samples)
    
    /* Basecase: Only the class attribute is left */
    } else {
        /* Initialization */
        let children = []
        let bestAttributeAndValue = mostInformativeAttribute(samples)
        let bestAttributeIndex = bestAttributeAndValue[0]
        let bestAttributeValue = bestAttributeAndValue[1]
        let attribute = attributes[bestAttributeIndex]

        let smallerChild = []
        let largerChild = []
        samples.forEach(sample => {
            if (parseFloat(sample[bestAttributeIndex]) <= bestAttributeValue) {
                smallerChild.push(sample)
            } else {
                largerChild.push(sample)
            }
        });

        if (smallerChild.length == 0 || largerChild.length == 0) {
            let decision = attributes.at(-1) + ": " + samples[0].at(-1)
            return new Leaf(decision, samples)
        }

        children.push(decisionTree(smallerChild, attributes, depth + 1))
        children.push(decisionTree(largerChild, attributes, depth + 1))

        /* Return the created Node */
        return new Node(attributes[bestAttributeIndex], bestAttributeValue, children, bestAttributeIndex)
    }
}

/*
Create the HTML representation of a tree and add it to the DOM.
Input: A Node or a Leaf. It is used as the root of the displayed tree.
Output: None.
*/
function treeToHtml(root) {
    /* Initialization */
    const treeContainer = document.getElementById('treeContainer')
    let rootHTML = document.createElement('ul')
    rootHTML.classList.add('tree')

    /* Start the creation of the HTML representation of the tree */
    if (root instanceof Node) {
        rootHTML.appendChild(getNodeHTML(root))
    } else if (root instanceof Leaf) {
        rootHTML.appendChild(getLeafHTML(root))
    }

    /* Delete the previous tree from the DOM and add the new one to the DOM */
    treeContainer.replaceChildren()
    treeContainer.appendChild(rootHTML)
}

/*
Creates the HTML representation of a Node
Input: A Node object
Output: HTML representation of the input
*/
function getNodeHTML(node) {
    /* Create the list element that represents a Node */
    let nodeHtml = document.createElement('li')

    /* Prepare the content span */
    let content = document.createElement('span')
    content.classList.add('node')

    /* Prepare the entries of content */
    let attribute = document.createElement('p')
    let textContent = 'Nächste Entscheidung: ' + String(node.attribute) + ' <= ' + node.attributeValue
    attribute.textContent = textContent

    /* Fill content with its entries */
    content.appendChild(attribute)

    /* Fill the list element with its content */
    nodeHtml.appendChild(content)
    
    /* Prepare the list containing the children of a node */
    let children = document.createElement('ul')

    /* Add the HTML representation of each Child.*/
    node.children.forEach(child => {
        /* If a child is a Node, use a recursive call of getNodeHTML */
        if (child instanceof Node) {
            children.appendChild(getNodeHTML(child))
        /* If a child is a Leaf, use getLeafHTML. Basecase. */
        } else if (child instanceof Leaf) {
            children.appendChild(getLeafHTML(child))
        }
    });

    /* Fill the list element with its children */
    nodeHtml.appendChild(children)

    /* Return the HTML representation of the input */
    return nodeHtml
}

/*
Creates the HTML representation of a Leaf
Input: A Leaf object
Output: HTML representation of the input
*/
function getLeafHTML(leaf) {
    /* Create the list element that represents a Leaf */
    let leafHTML = document.createElement('li')

    /* Prepare the content span */
    let content = document.createElement('span')
    content.classList.add('leaf')

    /* Prepare the entries of content */
    let decision = document.createElement('p')
    decision.textContent = 'Getroffene Entscheidung: ' + String(leaf.decision)

    /* Fill content with its entries */
    content.appendChild(decision)

    /* Fill the list element with its content */
    leafHTML.appendChild(content)

    /* Return the HTML representation of the input */
    return leafHTML
}

function getRandomInt(max) {
    return Math.random() * max;
}

function divideData(samples, proportion) {
    let targetLength = samples.length * proportion
    let trainingData = []
    let testData = samples

    while (trainingData.length < targetLength) {
        let i = getRandomInt(testData.length)
        trainingData.push(testData.splice(i, 1)[0])
    }

    return [trainingData, testData]
}

let classification = document.getElementById("classification")
function buildTestDataTable(samples) {
    classification.innerHTML = ''

    let Header = document.createElement('tr')
    
    let hKelch = document.createElement('th')
    hKelch.textContent = "Länge Kelchblatt"
    Header.appendChild(hKelch)
    let hKron = document.createElement('th')
    hKron.textContent = "Länge Kronblatt"
    Header.appendChild(hKron)

    let hClassReal = document.createElement('th')
    hClassReal.textContent = "Tatsächliche Gattung"
    Header.appendChild(hClassReal)
    let hClassDet = document.createElement('th')
    hClassDet.textContent = "Gattung laut Entscheidungsbaum"
    Header.appendChild(hClassDet)

    classification.appendChild(Header)

    samples.forEach(sample => {
        let tableRow = document.createElement('tr')

        let lKelch = document.createElement('td')
        lKelch.textContent = sample[0]
        tableRow.appendChild(lKelch)

        let lKron = document.createElement('td')
        lKron.textContent = sample[1]
        tableRow.appendChild(lKron)

        let classR = document.createElement('td')
        classR.textContent = sample[2]
        tableRow.appendChild(classR)

        let classD = document.createElement('td')
        classD.textContent = classify(sample, tree)
        tableRow.appendChild(classD)

        if (classR.textContent === classD.textContent ) {
            tableRow.className += " correct";
        } else {
            tableRow.className += " incorrect";
        }
        

        classification.appendChild(tableRow)
    });
}


function classify(sample, tree) {
    if (tree instanceof Leaf) {
        return tree.decision
    }

    let sampleAttrValue = parseFloat(sample[tree.attributeIndex])

    if (sampleAttrValue <= parseFloat(tree.attributeValue)) {
        return classify(sample, tree.children[0])
    } else {
        return classify(sample, tree.children[1])
    }
}


/* Initialization of global variables*/
let tree = undefined
let data = undefined

/* 
Action Listener
Trigger:   Upload of a new file
Execution: Fills data. 
*/
let file = document.getElementById('data')
file.addEventListener("change", function () {
    var reader = new FileReader()
    reader.onload = function() {
    data = this.result.split(/[\n\r]/)
    data = data.filter((str) => str != '')
      }
    reader.readAsText(this.files[0])
});

/* 
Action Listener
Trigger:   Click on drawTree button.
Execution: Creates and displays the tree. 
*/
let drawButton = document.getElementById('drawTree')
drawButton.addEventListener('click', function() {
    /* There is data */
    if (data != undefined) {
        /* Parsing of data */
        let attributes = data[0].split(',')
        let dataWithoutAttributes = data.slice(1, data.length)
        let samples = []

        maxDepth = document.getElementById('depth').value * 1
        ratio = document.getElementById('ratio').value / 100

        dataWithoutAttributes.forEach(datum => {
            samples.push(datum.split(','))
        });
        
        let dividedData = divideData(samples, ratio)
        let trainingData = dividedData[0]
        let testData = dividedData[1]
        

        tree = decisionTree(trainingData, attributes)
        treeToHtml(tree)

        buildTestDataTable(testData)
    }
})
