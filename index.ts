class Mapper<SourceType, DestinationType> {
    destinationObj: DestinationType = {} as DestinationType
    sourceObj: SourceType

    constructor(sObj: SourceType) {
        this.sourceObj = sObj
    }

    private isObject(obj: Object) {
        return obj === Object(obj)
    }

    map(sKey: string, dKey: keyof DestinationType | Record<keyof DestinationType, (value: any) => void>) {
        if (typeof dKey === "string") {
            const sourceValue = this.getSourcePropertyValue(sKey)
            this.setDestinationPropertyValue(dKey, sourceValue)
        } else if (this.isObject(dKey)) {
            this.handleDestinationObjectKey(
                dKey as Record<keyof DestinationType, (value: any) => void>,
                this.getSourcePropertyValue(sKey) as string
            )
        } else {
            throw new Error('The destination key must be either a string or an object')
        }

        return this
    }

    mapJoin(sKeys: string[], dKey: keyof DestinationType | Record<keyof DestinationType, (value: any) => void>, joinBy: string = " ") {
        if (sKeys.length === 0) {
            throw new Error("Source keys must be a valid list of keys!")
        } else {
            const joinedSourceValue = sKeys.reduce((acc, targetSourceKey, i): string => {
                const sourcePropertyValue = this.getSourcePropertyValue(targetSourceKey) as string
                return i === 0 ? sourcePropertyValue : acc + joinBy + sourcePropertyValue
            }, '')

            if (typeof dKey === "string") {
                this.setDestinationPropertyValue(dKey, joinedSourceValue)
            } else if (this.isObject(dKey)) {
                this.handleDestinationObjectKey(dKey as Record<keyof DestinationType, (value: any) => void>, joinedSourceValue)
            } else {
                throw new Error('The destination key must be either a string or an object')
            }
        }
        return this
    }

    private getSourcePropertyValue(key: string) {
        const keys = key.split('.')
        if (key.length === 1) {
            return this.sourceObj[key as keyof SourceType]
        }

        let currentObject = this.sourceObj
        let prevObject = this.sourceObj

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i] as keyof SourceType
            currentObject = prevObject[key] as SourceType
            prevObject = currentObject
        }

        return prevObject
    }

    private setDestinationPropertyValue(property: keyof DestinationType, value: unknown) {
        const destinationKeys = property.toString().split('.')
        if (destinationKeys.length === 1) {
            this.destinationObj[property] = <DestinationType[keyof DestinationType]>value
        } else {
            let currentObject = this.destinationObj
            for (let i = 0; i < destinationKeys.length - 1; i++) {
                const key = destinationKeys[i]
                if (!currentObject[key as keyof DestinationType]) {
                    currentObject[key as keyof DestinationType] = <DestinationType[keyof DestinationType]>{}
                }
                currentObject = <DestinationType>currentObject[key as keyof DestinationType]
            }

            currentObject[destinationKeys[destinationKeys.length - 1] as keyof DestinationType] = <DestinationType[keyof DestinationType]>value
        }
    }

    private handleDestinationObjectKey(dKey: Record<keyof DestinationType, (value: any) => void>, value: string) {
        const keys = Object.keys(dKey)
        if (keys.length === 0 || keys.length > 1) {
            throw new Error("Destination object must have one key!")
        } else {
            let destinationKey: Record<keyof DestinationType, (value: any) => void> = dKey
            const key = keys[0]
            let processFunction = <(value: any) => void>destinationKey[key as keyof DestinationType]

            if (typeof processFunction !== 'function') {
                throw new Error('The value of the destination object key must be a valid function')
            } else {
                this.setDestinationPropertyValue(key as keyof DestinationType, processFunction(value))
            }
        }
    }
}

export {Mapper}